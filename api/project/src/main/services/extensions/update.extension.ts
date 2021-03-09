export {};
import * as moment from "moment";
import { BaseService } from "@services/BaseService";

interface UpdateResult<RES> {
  body: RES | null;
}

declare module "@services/BaseService" {
  interface BaseService {
    update<RES>(
      entity: { id?: number | undefined } & Partial<Omit<RES, "id">>
    ): Promise<UpdateResult<RES>>;
  }
}

BaseService.prototype.update = async function <RES>(
  entity: { id?: number | undefined } & Partial<Omit<RES, "id">>
) {
  const names = entity.constructor.name.split("Entity");
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
    let value = (entity as any)[rowName];
    if (value === undefined) {
      continue;
    }
    params[rowName] = value;
  }

  const currentDate = moment().format("YYYY-MM-DD HH:mm:ss");
  params["updated_at"] = currentDate;
  const keys = Object.keys(params);
  const connection = this.getConnection();
  const sql = connection.sql;

  // prettier-ignore
  const updateResult = await sql`update ${sql(tableName)} set ${sql(params, ...keys)} where id = ${entity.id} returning *`;
  const ret = {
    body: updateResult.count === 1 ? updateResult[0] : null,
  };
  return ret;
};
