/**
 * DBアダプター毎の実装差異を吸収するためのコネクションのラッパー
 */
export class ConnectionWrapper {
  public constructor(private realConnection: any) {}
  public close() {
    this.realConnection.end();
  }
  public get sql() {
    return this.realConnection;
  }
}
