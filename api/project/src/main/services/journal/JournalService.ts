import { inject, injectable } from "inversify";
import { TYPES } from "@core/container/types";
import { BaseService } from "@services/BaseService";
import { ConnectionProvider } from "@core/connection/ConnectionProvider";
import { LedgerSearchRequest } from "@common/model/journal/LedgerSearchRequest";
import { LedgerSearchResponse } from "@common/model/journal/LedgerSearchResponse";
import { selectLedger as getSelectLedgerSql } from "./selectLedger.sql";
import { MasterService } from "@services/master/MasterService";
import { LedgerCreateRequest } from "@common/model/journal/LedgerCreateRequest";
import { LedgerUpdateRequest } from "@common/model/journal/LedgerUpdateRequest";
import {
  IJournalEntity,
  JournalEntity,
} from "@common/model/journal/JournalEntity";
import { SaimokuSearchResponse } from "@common/model/master/SaimokuSearchResponse";

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

  public async selectLedger(condition: LedgerSearchRequest) {
    const saimokuDetail = (
      await this.masterService.selectSaimokuDetail({
        saimoku_cd: condition.target_cd,
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
          if (res.karikata_cd === condition.target_cd) {
            res.kasikata_value = 0;
          } else {
            res.karikata_value = 0;
          }
        } else {
          res.acc = sumR - sumL;
          if (res.karikata_cd === condition.target_cd) {
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
        saimoku_cd: condition.ledgerCd,
      })
    )[0];
    const entity = toJournalEntity(condition, saimokuDetail);
    return await this.create<IJournalEntity>(entity);
  }

  public async updateLedger(condition: LedgerUpdateRequest) {
    const saimokuDetail = (
      await this.masterService.selectSaimokuDetail({
        saimoku_cd: condition.ledgerCd,
      })
    )[0];
    const entity = toJournalEntity(condition, saimokuDetail);
    return await this.update<IJournalEntity>(entity);
  }
}

const toJournalEntity = (
  condition: LedgerCreateRequest | LedgerUpdateRequest,
  saimokuDetail: SaimokuSearchResponse
) => {
  let value: number;
  if (condition.karikataValue == null && condition.kasikataValue == null) {
    throw new Error();
  }
  if (condition.karikataValue != null && condition.kasikataValue != null) {
    throw new Error();
  }
  if (condition.karikataValue != null) {
    value = condition.karikataValue;
  } else {
    value = condition.kasikataValue as number;
  }
  let karikata_cd: string;
  let kasikata_cd: string;
  if (saimokuDetail.kamoku_bunrui_type === "L") {
    if (condition.karikataValue != null) {
      karikata_cd = condition.ledgerCd;
      kasikata_cd = condition.anotherCd;
    } else {
      karikata_cd = condition.anotherCd;
      kasikata_cd = condition.ledgerCd;
    }
  } else {
    if (condition.kasikataValue != null) {
      karikata_cd = condition.anotherCd;
      kasikata_cd = condition.ledgerCd;
    } else {
      karikata_cd = condition.ledgerCd;
      kasikata_cd = condition.anotherCd;
    }
  }
  return new JournalEntity({
    id: condition.id,
    nendo: condition.nendo,
    date: condition.date,
    karikata_cd,
    karikata_value: value,
    kasikata_cd,
    kasikata_value: value,
    note: condition.note,
    checked: "0",
  });
};
