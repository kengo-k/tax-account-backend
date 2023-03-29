import { injectable } from "inversify";
import { ConnectionProvider } from "@core/connection/ConnectionProvider";

@injectable()
export abstract class BaseService {
  abstract connectionProvider: ConnectionProvider;
  constructor() {}

  public getConnection() {
    return this.connectionProvider.getConnection();
  }

  // MEMO: templateを使う予定がなくなったので削除。
  // 使いたくなった時のために一応残しておく。
  // ※prepared statementに名前付きパラメータが使用できなさそうだったため
  //
  // public getTemplateLoader(templatePath: string) {
  //   const template = fs.readFileSync(
  //     `${RootContext.templateRootDir}/${templatePath}`,
  //     "utf8"
  //   );
  //   return (param: any | undefined = undefined) => {
  //     return ejs.render(template, param);
  //   };
  // }
}
