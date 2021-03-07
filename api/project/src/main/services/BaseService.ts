import * as moment from "moment";
import { injectable } from "inversify";
import { ConnectionProvider } from "@core/connection/ConnectionProvider";

@injectable()
export abstract class BaseService {
  abstract connectionProvider: ConnectionProvider;
  constructor() {}

  public getConnection() {
    return this.connectionProvider.getConnection();
  }

  // MEMO: templateを使う予定がなくなったので削除。
  // 使いたくなった時のために一応残しておく。
  // ※prepared statementに名前付きパラメータが使用できなさそうだったため
  //
  // public getTemplateLoader(templatePath: string) {
  //   const template = fs.readFileSync(
  //     `${RootContext.templateRootDir}/${templatePath}`,
  //     "utf8"
  //   );
  //   return (param: any | undefined = undefined) => {
  //     return ejs.render(template, param);
  //   };
  // }

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
      sql: (sql) => sql`select * from ${sql(tableName)} where id = ${id}`,
    });
    // TODO データ件数が1でない場合はエラー
    return result[0];
  }

  public async select<RES>(option: {
    responseType: new () => RES;
    sql: (sql: any) => Promise<any>;
    resultHandler?: ((row: any) => RES) | undefined;
  }): Promise<RES[]> {
    const connection = this.getConnection();
    const result = await option.sql(connection.sql);
    const res: RES[] = [];

    for (const row of result) {
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
    const keys = Object.keys(params);
    const connection = this.getConnection();
    const sql = connection.sql;

    // prettier-ignore
    const result = await sql`insert into ${sql(tableName)} ${sql(params, ...keys)} returning id`;

    const ret = {
      command: result.command,
      success: result.count === 1,
      id: result[0].id,
    };
    return ret;
  }
}

const NULL = {};

export enum TreatNull {
  DefaultIgnore,
  DefaultNull,
}
