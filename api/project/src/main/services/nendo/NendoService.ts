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
    const setTemplate = this.selectByTemplate(JournalSearchResponse);
    const execute = setTemplate("service/nendo/selectNendoList.sql");
    const nendoList = execute({});

    return nendoList;
  }
}
