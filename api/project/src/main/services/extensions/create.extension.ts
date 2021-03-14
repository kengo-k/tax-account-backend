export {};
import { BaseService } from "@services/BaseService";
import * as moment from "moment";

declare module "@services/BaseService" {
  interface BaseService {
    create<RES extends {}>(entity: RES): Promise<RES | null>;
  }
}

BaseService.prototype.create = async function <RES extends {}>(entity: RES) {
  const names = entity.constructor.name.split("Entity");
  if (names.length != 2) {
    // TODO
    throw new Error();
  }
  const tableName = `${names[0].toLowerCase()}s`;

  const params: any = {};
  const rowNames = Object.keys(entity);

  for (const rowName of rowNames) {
    // idはシーケンス発番のため除外する
    // 作成日、更新日は現在時間を使用するため除外する
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
  params["created_at"] = currentDate;
  params["updated_at"] = currentDate;
  const keys = Object.keys(params);
  const connection = this.getConnection();
  const sql = connection.sql;

  // prettier-ignore
  const result = await sql`insert into ${sql(tableName)} ${sql(params, ...keys)} returning *`;
  return result.count === 1 ? result[0] : null;
};
