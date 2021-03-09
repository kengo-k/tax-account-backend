export {};
import { BaseService } from "@services/BaseService";

interface DeleteResult<RES> {
  body: RES | null;
}

declare module "@services/BaseService" {
  interface BaseService {
    delete<RES>(
      entity: { id?: number | undefined } & Partial<Omit<RES, "id">>
    ): Promise<DeleteResult<RES>>;
  }
}

BaseService.prototype.delete = async function <RES>(
  entity: { id?: number | undefined } & Partial<Omit<RES, "id">>
) {
  const names = entity.constructor.name.split("Entity");
  if (names.length != 2) {
    // TODO
    throw new Error();
  }
  const tableName = `${names[0].toLowerCase()}s`;
  const connection = this.getConnection();
  const sql = connection.sql;

  // prettier-ignore
  const deleteResult = await sql`delete from ${sql(tableName)} where id = ${entity.id} returning *`;
  const ret = {
    body: deleteResult.count === 1 ? deleteResult[0] : null,
  };
  return ret;
};
