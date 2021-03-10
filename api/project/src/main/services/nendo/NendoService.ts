import { inject } from "inversify";
import { TYPES } from "@core/container/types";
import { BaseService } from "@services/BaseService";
import { ConnectionProvider } from "@core/connection/ConnectionProvider";

export class NendoService extends BaseService {
  public constructor(
    @inject(TYPES.ConnectionProvider)
    public connectionProvider: ConnectionProvider
  ) {
    super();
  }

  public selectNendoList() {}
}
