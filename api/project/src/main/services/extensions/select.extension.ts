export {};
import { BaseService } from "@services/BaseService";

interface OptionType<RES> {
  responseType: new () => RES;
  sql: (sql: any) => Promise<any>;
  resultHandler?: ((row: any) => RES) | undefined;
}

declare module "@services/BaseService" {
  interface BaseService {
    select<RES>(option: OptionType<RES>): Promise<RES[]>;
  }
}

BaseService.prototype.select = async function <RES>(option: OptionType<RES>) {
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
};
