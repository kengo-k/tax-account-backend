import { inject, injectable } from "inversify";
import { TYPES } from "@core/container/types";
import { BaseService } from "@services/BaseService";
import { ConnectionProvider } from "@core/connection/ConnectionProvider";
import { LedgerSearchRequest } from "@common/model/journal/LedgerSearchRequest";
import { LedgerSearchResponse } from "@common/model/journal/LedgerSearchResponse";
import { selectLedger as getSelectLedgerSql } from "./selectLedger.sql";
import { MasterService } from "@services/master/MasterService";

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
}
