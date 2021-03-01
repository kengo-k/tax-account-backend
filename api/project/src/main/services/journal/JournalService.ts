import { inject } from "inversify";
import { TYPES } from "@core/container/types";
import { BaseService } from "@services/BaseService";
import "@services/extensions/getTemplate.extension";

export class JournalService extends BaseService {
  public constructor(
    @inject(TYPES.ConnectionProvider) public connectionProvider
  ) {
    super();
  }

  public createJournal() {
    const fromTemplate = this.getTemplate("service/journal/selectJournal.sql");
    const sql = fromTemplate({ nendo: 2021 });
    const connection = this.connectionProvider.getConnection();
    connection.connect();

    connection.query(sql, (err, res) => {
      if (err != null) {
        console.log(err);
        return;
      }
      console.log(res.rows);
      connection.end();
    });
  }
  public selectJournals() {}
  public updateJournal() {}
  public deleteJournals() {}
}
