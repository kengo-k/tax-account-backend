export {};
import { BaseService } from "@services/BaseService";
import { TreatNull, NULL } from "@services/misc";
import * as moment from "moment";

interface OptionType {
  entity: any;
  treatNull: TreatNull;
  ignoreRows: string[];
  nullRows: string[];
}

interface ResType {
  command: string;
  success: boolean;
  id: number;
}

declare module "@services/BaseService" {
  interface BaseService {
    create(option: OptionType): Promise<ResType>;
  }
}

BaseService.prototype.create = async function (option: OptionType) {
  const entity = option.entity;
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
};
