export {};
import { BaseService } from "@services/BaseService";

declare module "@services/BaseService" {
  interface BaseService {
    selectById<RES extends {}>(
      responseType: new () => RES,
      id: number
    ): Promise<RES | null>;
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
  try {
    const result = await this.select(
      responseType,
      (sql) => sql`select * from ${sql(tableName)} where id = ${id}`
    );
    return result.length === 1 ? result[0] : null;
  } catch (e) {
    throw e;
  }
};
