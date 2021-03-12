import "tsconfig-paths/register";
import * as child_process from "child_process";
import { ApplicationContext, Env } from "@core/ApplicationContext";
import { testServer } from "@test/testServer";

export default async function () {
  // テスト環境に切り替える
  ApplicationContext.setEnv(Env.test);
  // コネクションを生成しておく
  testServer.getConnection();
  // テスト前にDBを再作成する
  child_process.execSync("./init_test.sh");
  // 空のDBに初期データを設定する
  child_process.execSync("./import_test.sh init");
  // express起動
  await testServer.start();
}
