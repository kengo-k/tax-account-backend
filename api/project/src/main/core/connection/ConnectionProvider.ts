import * as fs from "fs";
import * as yaml from "js-yaml";
import { injectable } from "inversify";
import { ApplicationContext } from "@core/ApplicationContext";
import { ConnectionWrapper } from "@core/connection/ConnectionWrapper";

const postgres = require("postgres");

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
    const dbConfigValue = fs.readFileSync(dbConfigPath, "utf8");
    const dbConfig: any = yaml.load(dbConfigValue);
    const env = ApplicationContext.env;

    const host = dbConfig["common"]["host"];
    const username = dbConfig["common"]["username"];
    const password = dbConfig["common"]["username"];
    const database = dbConfig[env]["database"];

    const connection = postgres({
      host,
      username,
      password,
      database,
      port: 5432,
    });

    return new ConnectionWrapper(connection);
  }
}
