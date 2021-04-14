export {};
import { BaseService } from "@services/BaseService";
import { SQLError } from "@common/error/SystemError";

declare module "@services/BaseService" {
  interface BaseService {
    selectByResultRow<RES>(
      sql: (sql: any) => Promise<any>,
      handler: (row: any) => RES
    ): Promise<RES[]>;

    select<RES>(
      responseType: new () => RES,
      sql: (sql: any) => Promise<any>
    ): Promise<RES[]>;

    mapSelect<ROW, RES>(
      responseType: new () => ROW,
      sql: (sql: any) => Promise<any>,
      mapper: (row: ROW) => RES
    ): Promise<RES[]>;
  }
}

BaseService.prototype.selectByResultRow = async function <RES>(
  sql: (sql: any) => Promise<any>,
  handler: (row: any) => RES
) {
  const connection = this.getConnection();
  try {
    const result = await sql(connection.sql);
    const res: RES[] = [];
    for (const row of result) {
      res.push(handler(row));
    }
    return res;
  } catch (e) {
    throw new SQLError(e);
  }
};

BaseService.prototype.select = async function <ROW, RES>(
  responseType: new () => ROW,
  sql: (sql: any) => Promise<any>
) {
  return this.mapSelect(responseType, sql, (res) => res);
};

BaseService.prototype.mapSelect = async function <ROW, RES>(
  responseType: new () => ROW,
  sql: (sql: any) => Promise<any>,
  mapper: (row: ROW) => RES
) {
  const handler = (row: any) => {
    const elem: ROW = new responseType();
    const propNames = Object.getOwnPropertyNames(row);
    for (const propName of propNames) {
      const anyElem = (elem as any) as object;
      Reflect.set(anyElem, propName, row[propName]);
    }
    return mapper(elem);
  };
  return this.selectByResultRow(sql, handler);
};
