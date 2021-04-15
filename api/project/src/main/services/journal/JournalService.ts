import { inject, injectable } from "inversify";
import { TYPES } from "@core/container/types";
import { BaseService } from "@services/BaseService";
import { ConnectionProvider } from "@core/connection/ConnectionProvider";
import { LedgerSearchRequest } from "@common/model/journal/LedgerSearchRequest";
import { LedgerSearchResponse } from "@common/model/journal/LedgerSearchResponse";
import { selectLedger as getSelectLedgerSql } from "./selectLedger.sql";
import { SaimokuService } from "@services/master/SaimokuService";

@injectable()
export class JournalService extends BaseService {
  public constructor(
    @inject(TYPES.ConnectionProvider)
    public connectionProvider: ConnectionProvider,
    @inject(TYPES.SaimokuService)
    public saimokuService: SaimokuService
  ) {
    super();
  }

  public async selectLedger(condition: LedgerSearchRequest) {
    const saimokuDetail = (
      await this.saimokuService.selectSaimokuDetail({
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
          if ((res.karikata_cd = condition.target_cd)) {
            res.acc = sumL - sumR;
          } else {
            res.acc = sumR - sumL;
          }
        } else {
          if ((res.karikata_cd = condition.target_cd)) {
            res.acc = sumR - sumL;
          } else {
            res.acc = sumL - sumR;
          }
        }
        return res;
      }
    );
  }
}
