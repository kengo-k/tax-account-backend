export {};
import { JournalSearchResponse } from "@model/journal/JournalSearchResponse";
import { BaseService } from "@services/BaseService";
import "@services/extensions/getTemplate.extension";

declare module "@services/BaseService" {
  interface BaseService {
    withQueryTemplate<PARAM, RES>(
      sqlTemplatePath: string,
      param: PARAM
    ): (handler: (err: any, res: any) => RES[]) => Promise<RES[]>;

    selectByTemplate<RES>(
      returnClass: new () => RES
    ): (sqlTemplatePath: string) => <PARAM>(param: PARAM) => Promise<RES[]>;
  }
}

BaseService.prototype.withQueryTemplate = function <PARAM, RES>(
  sqlTemplatePath: string,
  param: PARAM
) {
  const me: BaseService = this;
  return async (handler: (err: any, res: any) => RES[]) => {
    const fromTemplate = me.getTemplate(sqlTemplatePath);
    const sql = fromTemplate(param);
    const connection = me.getConnection();
    connection.connect();
    const result = await connection.query(sql);
    console.log(result.rows);
    connection.end();
    return result.rows;
  };
};

BaseService.prototype.selectByTemplate = function <RES>(
  returnClass: new () => RES
) {
  const me: BaseService = this;
  return (sqlTemplatePath: string) => {
    return async <PARAM>(param: PARAM) => {
      const getSql = me.getTemplate(sqlTemplatePath);
      const sql = getSql(param);
      const connection = me.getConnection();

      //connection.connect();
      const result = await connection.query(sql);
      //connection.end();

      const ret: RES[] = [];
      const res = new returnClass();
      for (const row of result.rows) {
        const propNames = Object.getOwnPropertyNames(row);
        for (const propName of propNames) {
          const anyRes = (res as any) as object;
          Reflect.set(anyRes, propName, row[propName]);
        }
        ret.push(res);
      }
      console.log(ret);
      return ret;
    };
  };
};
