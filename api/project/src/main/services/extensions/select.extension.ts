export {};
import { BaseService } from "@services/BaseService";
import { SQLError } from "@common/error/SQLError";

export interface SelectResult<RES> {
  body: RES[];
}

interface SelectOption<RES> {
  resultHandler?: ((row: any) => RES) | undefined;
}

declare module "@services/BaseService" {
  interface BaseService {
    select<RES>(
      responseType: new () => RES,
      sql: (sql: any) => Promise<any>,
      option?: SelectOption<RES> | undefined
    ): Promise<SelectResult<RES>>;
  }
}

BaseService.prototype.select = async function <RES>(
  responseType: new () => RES,
  sql: (sql: any) => Promise<any>,
  option: SelectOption<RES> | undefined = undefined
) {
  if (option == null) {
    option = {
      resultHandler: undefined,
    };
  }
  const connection = this.getConnection();
  try {
    const result = await sql(connection.sql);
    const res: RES[] = [];
    for (const row of result) {
      if (option.resultHandler == null) {
        const elem: RES = new responseType();
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
    const ret = {
      body: res,
    };

    return ret;
  } catch (e) {
    throw new SQLError(e);
  }
};
