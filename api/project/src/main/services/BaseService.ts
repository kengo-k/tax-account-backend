import * as fs from "fs";
import * as ejs from "ejs";
import * as moment from "moment";
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

  public async selectById<RES extends {}>(
    responseType: new () => RES,
    id: number
  ) {
    const entity = new responseType();
    const names = entity.constructor.name.split("Entity");
    if (names.length != 2) {
      // TODO
      throw new Error();
    }
    const tableName = `${names[0].toLowerCase()}s`;
    const result = await this.select({
      responseType,
      sql: `select * from ${tableName} where id = ${id}`,
    });
    // TODO データ件数が1でない場合はエラー
    return result[0];
  }

  public async select<RES>(option: {
    responseType: new () => RES;
    sql?: string | undefined;
    sqlParams?: any | undefined;
    sqlTemplate?: string | undefined;
    sqlTemplateParams?: any | undefined;
    sqlParam?: any | undefined;
    resultHandler?: ((row: any) => RES) | undefined;
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

  // TODO undefinedな値をどうするか、とかそのあたりをオプションで柔軟に扱えるようにする
  public async create(option: {
    entity: any;
    treatNull: TreatNull;
    ignoreRows: string[];
    nullRows: string[];
  }) {
    const entity = option.entity;
    if (entity?.constructor?.name == null) {
      // TODO
      throw new Error();
    }
    let names = entity.constructor.name.split("Entity");
    if (names.length != 2) {
      // TODO
      throw new Error();
    }
    const tableName = `${names[0].toLowerCase()}s`;

    const params: any = {};
    const rowNames = Object.keys(entity);

    for (const rowName of rowNames) {
      if (["id", "created_at", "updated_at"].includes(rowName)) {
        continue;
      }
      let value = entity[rowName];
      if (value == null) {
        if (option.ignoreRows.includes(rowName)) {
          continue;
        }
        if (option.nullRows.includes(rowName)) {
          value = NULL;
        }
        if (option.treatNull === TreatNull.DefaultIgnore) {
          continue;
        } else {
          value = NULL;
        }
      }
      params[rowName] = value;
    }
    const currentDate = moment().format("YYYY-MM-DD HH:mm:ss");
    params["created_at"] = currentDate;
    params["updated_at"] = currentDate;
    const getParam = getParamFromParams(params);
    const keys = Object.keys(params);
    const sqlString = `insert into
${tableName}(${keys.join(",")})
values(${keys.map(getParam)})
returning id
`;
    const connection = this.getConnection();
    const result = await connection.query(sqlString);
    return {
      command: result.command,
      success: result.rowCount === 1,
      id: result.rows[0].id,
    };
  }
}

const NULL = {};

export enum TreatNull {
  DefaultIgnore,
  DefaultNull,
}

const getParamFromParams = (params: any) => (key: string) => {
  // TODO SQLインジェクション対策
  let param = params[key];
  if (param === NULL) {
    param = "null";
  } else if (typeof param === "string") {
    param = `'${param}'`;
  }
  return param;
};
