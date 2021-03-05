import * as fs from "fs";
import * as yaml from "js-yaml";
import { Client } from "pg";
import { injectable } from "inversify";
import { RootContext } from "@core/RootContext";

@injectable()
export class ConnectionProvider {
  private connection: Client;

  public constructor() {
    this.connection = this.createConnection();
  }

  public getConnection() {
    return this.connection;
  }

  private createConnection(): Client {
    const dbConfigPath = `${RootContext.apiRootDir}/database.yml`;
    const dbConfigValue = fs.readFileSync(dbConfigPath, "utf8");
    const dbConfig = yaml.load(dbConfigValue);

    const host = dbConfig["common"]["host"];
    const user = dbConfig["common"]["username"];
    const password = dbConfig["common"]["username"];
    // TODO: 環境に応じて切り替えること
    const database = dbConfig["development"]["database"];

    // console.log("----- database access information -----");
    // console.log(`host: ${host}`);
    // console.log(`username: ${user}`);
    // console.log(`password: ${password}`);
    // console.log(`database : ${database}`);

    const client = new Client({
      host,
      user,
      password,
      database,
      port: 5432,
    });

    return client;
  }
}
