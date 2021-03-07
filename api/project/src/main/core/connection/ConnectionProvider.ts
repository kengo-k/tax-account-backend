import * as fs from "fs";
import * as yaml from "js-yaml";
import { injectable } from "inversify";
import { ApplicationContext } from "@core/ApplicationContext";
import { ConnectionWrapper } from "@core/connection/ConnectionWrapper";

const postgres = require("postgres");

@injectable()
export class ConnectionProvider {
  private connection: ConnectionWrapper;

  public constructor() {
    this.connection = this.createConnection();
  }

  public getConnection() {
    return this.connection;
  }

  private createConnection(): ConnectionWrapper {
    const dbConfigPath = `${ApplicationContext.apiRootDir}/database.yml`;
    const dbConfigValue = fs.readFileSync(dbConfigPath, "utf8");
    const dbConfig: any = yaml.load(dbConfigValue);

    const host = dbConfig["common"]["host"];
    const username = dbConfig["common"]["username"];
    const password = dbConfig["common"]["username"];
    // TODO: 環境に応じて切り替えること
    const database = dbConfig["development"]["database"];

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
