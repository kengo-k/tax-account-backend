import { ConnectionProvider } from "@core/connection/ConnectionProvider";
import { TYPES } from "@core/container/types";
import { KamokuBunruiCodeConst } from "@kengo-k/account-common/constant/kamokuBunrui";
import {
  EntitySearchCondition,
  EntitySearchType,
  Order,
} from "@kengo-k/account-common/model/Entity";
import {
  IJournalEntity,
  JournalEntity,
} from "@kengo-k/account-common/model/journal/JournalEntity";
import { JournalSearchRequest } from "@kengo-k/account-common/model/journal/JournalSearchRequest";
import { KamokuBunruiSummaryRequest } from "@kengo-k/account-common/model/journal/KamokuBunruiSummaryRequest";
import { KamokuBunruiSummaryResponse } from "@kengo-k/account-common/model/journal/KamokuBunruiSummaryResponse";
import { LedgerCreateRequest } from "@kengo-k/account-common/model/journal/LedgerCreateRequest";
import { LedgerSearchRequest } from "@kengo-k/account-common/model/journal/LedgerSearchRequest";
import { LedgerSearchResponse } from "@kengo-k/account-common/model/journal/LedgerSearchResponse";
import { LedgerUpdateRequest } from "@kengo-k/account-common/model/journal/LedgerUpdateRequest";
import { TaxCalcRequest } from "@kengo-k/account-common/model/journal/TaxCalcRequest";
import { TaxCalcResponse } from "@kengo-k/account-common/model/journal/TaxCalcResponse";
import { SaimokuSearchResponse } from "@kengo-k/account-common/model/master/SaimokuSearchResponse";
import { PagingRequest } from "@kengo-k/account-common/model/PagingCondition";
import { BaseService } from "@services/BaseService";
import { selectLedger as getSelectLedgerSql } from "@services/journal/selectLedger.sql";
import { summaryKamokuBunrui as getKamokuBunruiSummarySql } from "@services/journal/summaryKamokuBunrui.sql";
import { MasterService } from "@services/master/MasterService";
import { inject, injectable } from "inversify";

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
    if (condition.page_no != null && condition.page_size != null) {
      entityCondition.paging = new PagingRequest({
        page_no: condition.page_no,
        page_size: condition.page_size,
      });
    }
    return await this.selectByEntity(JournalEntity, entityCondition);
  }

  public async selectLedger(condition: LedgerSearchRequest) {
    condition.month = condition.month ?? "all";
    condition.page_no = condition.page_no ?? 1;
    condition.page_size = condition.page_size ?? 10;
    const saimokuDetail = (
      await this.masterService.selectSaimokuDetail({
        saimoku_cd: condition.ledger_cd,
      })
    )[0];
    let all_count;
    const result = await this.mapSelect(
      LedgerSearchResponse,
      getSelectLedgerSql(condition),
      (res) => {
        // TODO もうちょっとなんとかしたい
        all_count = (res as any).all_count;
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
            res.kasikata_value = 0;
          } else {
            res.karikata_value = 0;
          }
        }
        return res;
      }
    );
    return { all_count, list: result };
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
    // TODO 前年度事業税を取得
    const preBizTax = 0;
    // 所得
    const income = sales - expenses - preBizTax;

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
    const fixedCotax = trun100(cotax);

    // 地方法人税額を算出する
    const localCotaxBase = trun1000(fixedCotax);
    const localCotaxRate = 0.044;
    const localCotax = localCotaxBase * localCotaxRate;
    const fixedLocalCotax = trun100(localCotax);

    // 市民税(都民税)を算出する
    const municipalTaxBase = trun1000(fixedCotax);
    const municipalTaxRate = 0.129;
    const municipalTax = municipalTaxBase * municipalTaxRate;
    const fixedMunicipalTax = trun100(municipalTax) + 70000;

    // 事業税を算出する
    const bizTaxBase = trun1000(income);
    const bizTaxRate = 0.035;
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
