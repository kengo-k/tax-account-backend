const postgres = require("postgres");

/**
 * DBアダプター毎の実装差異を吸収するためのコネクションのラッパー
 */
export class ConnectionWrapper {
  private _connection: any;
  public constructor(
    readonly host: string,
    readonly username: string,
    readonly password: string,
    readonly database: string,
    readonly port: number) {
    this._connection = postgres({
      host,
      username,
      password,
      database,
      port,
    });
  }
  public close() {
    this._connection.end();
  }
  public get sql() {
    return this._connection;
  }
}
