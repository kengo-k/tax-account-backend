import { inject, injectable } from "inversify";
import { TYPES } from "@core/container/types";
import { BaseService } from "@services/BaseService";
import { ConnectionProvider } from "@core/connection/ConnectionProvider";
import { LedgerSearchRequest } from "@common/model/journal/LedgerSearchRequest";
import { LedgerSearchResponse } from "@common/model/journal/LedgerSearchResponse";
import { selectLedger as getSelectLedgerSql } from "@services/journal/selectLedger.sql";
import { summaryKamokuBunrui as getKamokuBunruiSummarySql } from "@services/journal/summaryKamokuBunrui.sql";
import { MasterService } from "@services/master/MasterService";
import { LedgerCreateRequest } from "@common/model/journal/LedgerCreateRequest";
import { LedgerUpdateRequest } from "@common/model/journal/LedgerUpdateRequest";
import {
  IJournalEntity,
  JournalEntity,
} from "@common/model/journal/JournalEntity";
import { SaimokuSearchResponse } from "@common/model/master/SaimokuSearchResponse";
import {
  EntitySearchCondition,
  EntitySearchType,
  Order,
} from "@common/model/Entity";
import { JournalSearchRequest } from "@common/model/journal/JournalSearchRequest";
import { KamokuBunruiSummaryRequest } from "@common/model/journal/KamokuBunruiSummaryRequest";
import { KamokuBunruiSummaryResponse } from "@common/model/journal/KamokuBunruiSummaryResponse";
import { TaxCalcRequest } from "@common/model/journal/TaxCalcRequest";
import { TaxCalcResponse } from "@common/model/journal/TaxCalcResponse";
import { KamokuBunruiCodeConst } from "@common/constant/kamokuBunrui";

@injectable()
export class JournalService extends BaseService {
  public constructor(
    @inject(TYPES.ConnectionProvider)
    public connectionProvider: ConnectionProvider,
    @inject(TYPES.MasterService)
    public masterService: MasterService
  ) {
    super();
  }

  public async selectJournals(condition: JournalSearchRequest) {
    const entityCondition: EntitySearchCondition<JournalEntity> = {
      nendo: {
        searchType: EntitySearchType.Eq,
        value: condition.nendo,
      },
    };
    if (condition.date_from != null && condition.date_to != null) {
      entityCondition.date = {
        searchType: EntitySearchType.Between,
        fromTo: [condition.date_from, condition.date_to],
      };
    } else if (condition.date_from != null) {
      entityCondition.date = {
        searchType: EntitySearchType.GtE,
        value: condition.date_from,
      };
    } else if (condition.date_to != null) {
      entityCondition.date = {
        searchType: EntitySearchType.LtE,
        value: condition.date_to,
      };
    }
    if (condition.latest_order !== undefined) {
      if (condition.latest_order) {
        entityCondition.orderBy = [["updated_at", Order.Desc]];
      } else {
        entityCondition.orderBy = [["updated_at", Order.Asc]];
      }
    }
    if (condition.largest_order !== undefined) {
      if (condition.largest_order) {
        entityCondition.orderBy = [["karikata_value", Order.Desc]];
      } else {
        entityCondition.orderBy = [["karikata_value", Order.Asc]];
      }
    }
    if (entityCondition.orderBy == null) {
      entityCondition.orderBy = [];
    }
    // デフォルトOrder条件
    entityCondition.orderBy.push(["date", Order.Desc]);
    entityCondition.orderBy.push(["id", Order.Desc]);
    return await this.selectByEntity(JournalEntity, entityCondition);
  }

  public async selectLedger(condition: LedgerSearchRequest) {
    if (condition.month == null) {
      condition.month = "-1";
    }
    const saimokuDetail = (
      await this.masterService.selectSaimokuDetail({
        saimoku_cd: condition.ledger_cd,
      })
    )[0];
    return await this.mapSelect(
      LedgerSearchResponse,
      getSelectLedgerSql(condition),
      (res) => {
        const sumL = res.karikata_sum;
        const sumR = res.kasikata_sum;
        if (saimokuDetail.kamoku_bunrui_type === "L") {
          res.acc = sumL - sumR;
          if (res.karikata_cd === condition.ledger_cd) {
            res.kasikata_value = 0;
          } else {
            res.karikata_value = 0;
          }
        } else {
          res.acc = sumR - sumL;
          if (res.karikata_cd === condition.ledger_cd) {
            res.karikata_value = 0;
          } else {
            res.kasikata_value = 0;
          }
        }
        return res;
      }
    );
  }

  public async createLedger(condition: LedgerCreateRequest) {
    const saimokuDetail = (
      await this.masterService.selectSaimokuDetail({
        saimoku_cd: condition.ledger_cd,
      })
    )[0];
    const entity = toJournalEntity(condition, saimokuDetail);
    return await this.create<IJournalEntity>(entity);
  }

  public async updateLedger(condition: LedgerUpdateRequest) {
    const saimokuDetail = (
      await this.masterService.selectSaimokuDetail({
        saimoku_cd: condition.ledger_cd,
      })
    )[0];
    const entity = toJournalEntity(condition, saimokuDetail);
    return await this.update<IJournalEntity>(entity);
  }

  public async summaryKamokuBunrui(condition: KamokuBunruiSummaryRequest) {
    const summaryList = await this.mapSelect(
      KamokuBunruiSummaryResponse,
      getKamokuBunruiSummarySql(condition),
      (res) => {
        const sumL = res.karikata_kamoku_bunrui_sum;
        const sumR = res.kasikata_kamoku_bunrui_sum;
        if (
          [
            KamokuBunruiCodeConst.ASSETS,
            KamokuBunruiCodeConst.EXPENSES,
          ].includes(condition.kamoku_bunrui_cd)
        ) {
          res.value = sumL - sumR;
        } else {
          res.value = sumR - sumL;
        }
        return res;
      }
    );
    return summaryList[0];
  }

  public async calcTax(condition: TaxCalcRequest) {
    const trun100 = trunc(100);
    const trun1000 = trunc(1000);
    // 売上計を取得する
    const _sales = await this.summaryKamokuBunrui({
      nendo: condition.nendo,
      kamoku_bunrui_cd: KamokuBunruiCodeConst.SALES,
    });
    const sales = _sales.value;
    // 経費計を取得する
    const _expenses = await this.summaryKamokuBunrui({
      nendo: condition.nendo,
      kamoku_bunrui_cd: KamokuBunruiCodeConst.EXPENSES,
    });
    const expenses = _expenses.value;
    // 所得
    const income = sales - expenses;
    // 800万までの部分とそれ以降の部分に分ける
    const incomeUnder800 = income >= 8000000 ? 8000000 : income;
    const incomeOver800 =
      income - incomeUnder800 > 0 ? income - incomeUnder800 : 0;
    const cotaxBaseUnder800 = trun1000(incomeUnder800);
    const cotaxBaseOver800 = trun1000(incomeOver800);
    // 法人税率 ※税率変更がないか毎年チェック！！
    const cotaxRateUnder800 = 0.15;
    const cotaxRateOver800 = 0.232;

    // 法人税率をそれぞれに決定する
    // 法人税額を算出する
    const cotaxBase =
      cotaxBaseUnder800 * cotaxRateUnder800 +
      cotaxBaseOver800 * cotaxRateOver800;
    // 銀行の利息等のすでに差し引かれている税額
    // TODO あとで
    const cotaxDeduction = 0;
    const cotax = cotaxBase - cotaxDeduction;
    const fixedCotax = trun1000(cotax);

    // 地方法人税額を算出する
    const localCotaxBase = cotaxBase;
    const localCotaxRate = 0.044;
    const localCotax = localCotaxBase * localCotaxRate;
    const fixedLocalCotax = trun100(localCotax);

    // 市民税(都民税)を算出する
    const municipalTaxBase = cotaxBase;
    const municipalTaxRate = 0.129;
    const municipalTax = municipalTaxBase * municipalTaxRate;
    const fixedMunicipalTax = trun100(municipalTax);

    // 事業税を算出する
    const bizTaxBase = trun1000(income);
    const bizTaxRate = 0.034;
    const bizTax = bizTaxBase * bizTaxRate;
    const fixedBizTax = trun100(bizTax);

    // 地方法人特別税
    const specialLocalCotaxBase = fixedBizTax;
    const specialLocalCotaxRate = 0.432;
    const specialLocalCotax = specialLocalCotaxBase * specialLocalCotaxRate;
    const fixedSpecialLocalCotax = trun100(specialLocalCotax);

    const result = {
      sales,
      expenses,
      income,
      incomeUnder800,
      incomeOver800,
      cotaxBaseUnder800,
      cotaxBaseOver800,
      cotaxRateUnder800,
      cotaxRateOver800,
      cotaxBase,
      cotaxDeduction,
      cotax,
      fixedCotax,
      localCotaxBase,
      localCotaxRate,
      localCotax,
      fixedLocalCotax,
      municipalTaxBase,
      municipalTaxRate,
      municipalTax,
      fixedMunicipalTax,
      bizTaxBase,
      bizTaxRate,
      bizTax,
      fixedBizTax,
      specialLocalCotaxBase,
      specialLocalCotaxRate,
      specialLocalCotax,
      fixedSpecialLocalCotax,
    };
    return new TaxCalcResponse(result);
  }
}

const toJournalEntity = (
  condition: LedgerCreateRequest | LedgerUpdateRequest,
  saimokuDetail: SaimokuSearchResponse
) => {
  let value: number;
  // 金額が両方nullはありえないのでエラー
  if (condition.karikata_value === null && condition.kasikata_value === null) {
    throw new Error();
  }
  // 金額が両方設定されることはありえないのでエラー
  if (condition.karikata_value != null && condition.kasikata_value != null) {
    throw new Error();
  }
  if (condition.karikata_value != null) {
    value = condition.karikata_value;
  } else {
    value = condition.kasikata_value!;
  }
  let karikata_cd: string;
  let kasikata_cd: string;
  if (saimokuDetail.kamoku_bunrui_type === "L") {
    if (condition.karikata_value != null) {
      karikata_cd = condition.ledger_cd;
      kasikata_cd = condition.other_cd;
    } else {
      karikata_cd = condition.other_cd;
      kasikata_cd = condition.ledger_cd;
    }
  } else {
    if (condition.kasikata_value != null) {
      karikata_cd = condition.other_cd;
      kasikata_cd = condition.ledger_cd;
    } else {
      karikata_cd = condition.ledger_cd;
      kasikata_cd = condition.other_cd;
    }
  }
  const entityValue: Partial<IJournalEntity> = {
    karikata_cd,
    karikata_value: value,
    kasikata_cd,
    kasikata_value: value,
    checked: "0",
  };
  if ("id" in condition) {
    entityValue.id = condition.id;
  } else {
    if (condition.nendo != null) {
      entityValue.nendo = condition.nendo;
    }
    if (condition.date != null) {
      entityValue.date = condition.date;
    }
    if (condition.note != null) {
      entityValue.note = condition.note;
    }
  }
  return new JournalEntity(entityValue);
};

const trunc = (unit: number) => (num: number) => {
  return Math.trunc(num / unit) * unit;
};
