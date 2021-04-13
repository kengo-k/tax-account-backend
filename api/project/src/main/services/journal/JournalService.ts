import { inject, injectable } from "inversify";
import { TYPES } from "@core/container/types";
import { BaseService } from "@services/BaseService";
import { ConnectionProvider } from "@core/connection/ConnectionProvider";
import { LedgerSearchRequest } from "@common/model/journal/LedgerSearchRequest";
import { LedgerSearchResponse } from "@common/model/journal/LedgerSearchResponse";
import { selectLedger as getSelectLedgerSql } from "./selectLedger.sql";

@injectable()
export class JournalService extends BaseService {
  public constructor(
    @inject(TYPES.ConnectionProvider)
    public connectionProvider: ConnectionProvider
  ) {
    super();
  }

  public async selectLedger(condition: LedgerSearchRequest) {
    return await this.select(
      LedgerSearchResponse,
      getSelectLedgerSql(condition)
    );
  }
}
