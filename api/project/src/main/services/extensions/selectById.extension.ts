export {};
import { BaseService } from "@services/BaseService";

export interface SelectByIdResult<RES> {
  body: RES | null;
}

declare module "@services/BaseService" {
  interface BaseService {
    selectById<RES extends {}>(
      responseType: new () => RES,
      id: number
    ): Promise<SelectByIdResult<RES>>;
  }
}

BaseService.prototype.selectById = async function <RES extends {}>(
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
  const result = await this.select(
    responseType,
    (sql) => sql`select * from ${sql(tableName)} where id = ${id}`
  );

  const ret = {
    body: result.body.length === 1 ? result.body[0] : null,
  };

  return ret;
};
