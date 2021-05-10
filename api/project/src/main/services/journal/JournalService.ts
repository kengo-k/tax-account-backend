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
import { EntitySearchType, Order } from "@common/model/Entity";
import { JournalSearchRequest } from "@common/model/journal/JournalSearchRequest";
import { KamokuBunruiSummaryRequest } from "@common/model/journal/KamokuBunruiSummaryRequest";
import { KamokuBunruiSummaryResponse } from "@common/model/journal/KamokuBunruiSummaryResponse";
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
    return await this.selectByEntity(JournalEntity, {
      nendo: {
        searchType: EntitySearchType.StringEqual,
        value: condition.nendo,
      },
      orderBy: [["created_at", Order.Desc]],
    });
  }

  public async selectLedger(condition: LedgerSearchRequest) {
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
