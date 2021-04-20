export {};
import { BaseService } from "@services/BaseService";
import { SQLError } from "@common/error/SystemError";
import {
  EntitySearchCondition,
  EntitySearchItem,
  EntitySearchType,
} from "@common/model/Entity";
const snakecase = require("lodash.snakecase");

declare module "@services/BaseService" {
  interface BaseService {
    /**
     * 汎用的なセレクト処理。任意のSQL文を実行し任意のハンドラで値を抽出する
     * @param sql
     * @param handler
     */
    selectByResultRow<RES>(
      sql: (sql: any) => Promise<any>,
      handler: (row: any) => RES
    ): Promise<RES[]>;

    /**
     * 任意のSQLを実行しSQLが返す型に合わせたクラスに自動でマッピングするセレクト処理
     * @param responseType
     * @param sql
     */
    select<RES>(
      responseType: new () => RES,
      sql: (sql: any) => Promise<any>
    ): Promise<RES[]>;

    /**
     * 任意のSQLを実行しSQLが返す型に合わせたクラスに自動でマッピングするセレクト処理。
     * 追加で自動マッピングした値に対して変換処理を指定できるバージョン。
     * @param responseType
     * @param sql
     * @param mapper
     */
    mapSelect<ROW, RES>(
      responseType: new () => ROW,
      sql: (sql: any) => Promise<any>,
      mapper: (row: ROW) => RES
    ): Promise<RES[]>;

    /**
     * エンティティを検索条件としてエンティティの一覧を返す汎用検索
     * @param entityType
     * @param entity
     */
    selectByEntity<ENTITY>(
      entityType: new () => ENTITY,
      entity: EntitySearchCondition<ENTITY>
    ): Promise<ENTITY[]>;
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

const handlerFactory = <ROW>(responseType: new () => ROW) => (row: any) => {
  const elem: ROW = new responseType();
  const propNames = Object.getOwnPropertyNames(row);
  for (const propName of propNames) {
    const anyElem = (elem as any) as object;
    Reflect.set(anyElem, propName, row[propName]);
  }
  return elem;
};

BaseService.prototype.mapSelect = async function <ROW, RES>(
  responseType: new () => ROW,
  sql: (sql: any) => Promise<any>,
  mapper: (row: ROW) => RES
) {
  const handler = (row: any) => {
    const elem = handlerFactory(responseType)(row);
    return mapper(elem);
  };
  return this.selectByResultRow(sql, handler);
};

BaseService.prototype.selectByEntity = async function <ENTITY extends {}>(
  entityType: new () => ENTITY,
  entity: EntitySearchCondition<ENTITY>
) {
  const dummy = new entityType();
  const names = dummy.constructor.name.split("Entity");
  if (names.length != 2) {
    // TODO
    throw new Error();
  }
  const tableName = snakecase(`${names[0]}s`);
  const connection = this.getConnection();
  const ret: ENTITY[] = [];
  const wheres: string[] = [];
  const values: any[] = [];
  let index = 1;
  for (const propName of Object.keys(entity)) {
    if (propName === "orderBy") {
      continue;
    }
    const cond = (entity as any)[propName] as EntitySearchItem;
    if (cond.searchType === EntitySearchType.StringEqual) {
      wheres.push(`${propName} = $${index++}`);
      values.push(cond.value);
    }
  }
  const where = wheres.join(" and ");
  const orderBy =
    entity.orderBy != null && entity.orderBy.length > 0
      ? `order by ${entity.orderBy.map((o) => o.join(" ")).join(",")}`
      : "";
  const result = await connection.sql.unsafe(
    `select * from ${tableName} ${
      where.length > 0 ? `where ${where}` : ""
    } ${orderBy}`,
    values
  );
  const handler = handlerFactory(entityType);
  for (const row of result) {
    ret.push(handler(row));
  }
  return ret;
};
