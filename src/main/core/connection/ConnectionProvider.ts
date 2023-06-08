import { ApplicationContext } from "@core/ApplicationContext";
import { ConnectionWrapper } from "@core/connection/ConnectionWrapper";
import * as fs from "fs";
import { injectable } from "inversify";
import * as yaml from "js-yaml";

@injectable()
export class ConnectionProvider {
  private connection: ConnectionWrapper | undefined;

  public constructor() {}

  public getConnection() {
    if (this.connection == null) {
      this.connection = this.createConnection();
    }
    return this.connection as any as ConnectionWrapper;
  }

  private createConnection(): ConnectionWrapper {
    const dbConfigPath = ApplicationContext.configFilePath;
    console.log("config: ", dbConfigPath);
    const dbConfigValue = fs.readFileSync(dbConfigPath, "utf8");
    console.log("config value: ", dbConfigValue);
    const dbConfig: any = yaml.load(dbConfigValue);
    const env = ApplicationContext.env;

    const host = dbConfig["common"]["host"];
    const username = dbConfig["common"]["username"];
    const password = dbConfig["common"]["username"];
    const database = dbConfig[env]["database"];
    const port = dbConfig["common"]["port"];

    return new ConnectionWrapper(host, username, password, database, port);
  }
}
