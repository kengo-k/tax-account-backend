import { injectable } from "inversify";
import { ConnectionProvider } from "@core/connection/ConnectionProvider";

@injectable()
export abstract class BaseService {
  abstract connectionProvider: ConnectionProvider;
  constructor() {}
}
