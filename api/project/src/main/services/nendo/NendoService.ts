import { inject } from "inversify";
import { TYPES } from "@core/container/types";
import { BaseService } from "@services/BaseService";
import { JournalSearchResponse } from "@model/journal/JournalSearchResponse";

export class NendoService extends BaseService {
  public constructor(
    @inject(TYPES.ConnectionProvider) public connectionProvider
  ) {
    super();
  }

  public selectNendoList() {
    const nendoList = this.select({
      responseType: JournalSearchResponse,
      sqlTemplate: "service/nendo/selectNendoList.sql",
    });
    return nendoList;
  }
}
