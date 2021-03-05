import * as fs from "fs";
import * as ejs from "ejs";
import { injectable } from "inversify";
import { Client } from "pg";
import { RootContext } from "@core/RootContext";
import { ConnectionProvider } from "@core/connection/ConnectionProvider";

@injectable()
export abstract class BaseService {
  abstract connectionProvider: ConnectionProvider;
  constructor() {}

  public getConnection(): Client {
    return this.connectionProvider.getConnection();
  }

  public getTemplateLoader(templatePath: string) {
    const template = fs.readFileSync(
      `${RootContext.templateRootDir}/${templatePath}`,
      "utf8"
    );
    return (param: any | undefined = undefined) => {
      return ejs.render(template, param);
    };
  }

  public async select<RES>(option: {
    responseType: new () => RES;
    sql?: string | undefined;
    sqlParams?: any | undefined;
    sqlTemplate?: string | undefined;
    sqlTemplateParams?: any | undefined;
    sqlParam?: any | undefined;
    resultHandler?: (row: any) => RES | undefined;
  }): Promise<RES[]> {
    let sqlString = option.sql;
    if (option.sqlTemplate != null) {
      const loadSqlTemplate = this.getTemplateLoader(option.sqlTemplate);
      sqlString = loadSqlTemplate(option.sqlTemplateParams);
    }

    if (sqlString == null) {
      // TODO エラー整理
      throw new Error();
    }

    const connection = this.getConnection();
    const result = await connection.query(sqlString);
    const res: RES[] = [];

    for (const row of result.rows) {
      if (option.resultHandler == null) {
        const elem: RES = new option.responseType();
        const propNames = Object.getOwnPropertyNames(row);
        for (const propName of propNames) {
          const anyElem = (elem as any) as object;
          Reflect.set(anyElem, propName, row[propName]);
        }
        res.push(elem);
      } else {
        const elem = option.resultHandler(row);
        res.push(elem);
      }
    }

    return res;
  }
}
