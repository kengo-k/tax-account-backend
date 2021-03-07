import { ApplicationContext, Env } from "@core/ApplicationContext";
import { testServer } from "@test/testServer";
import * as child_process from "child_process";

beforeAll(async () => {
  // DB接続環境をtestに設定する
  ApplicationContext.setEnv(Env.development);
  // テスト開始前にDBへ接続しておく
  testServer.getConnection();
  // テスト前にDBを再作成する
  child_process.execSync("./init_test.sh");
  // 空のDBに初期データを設定する
  child_process.execSync("./import_test.sh init");
  // expressを起動
  await testServer.start();
});

afterAll(() => {
  // テスト終了後にDB接続を切断する
  const connection = testServer.getConnection();
  connection.close();
  // expressを終了
  testServer.stop();
});

test("test insert and select", async () => {
  const client = testServer.getClient();
  const result = await client.post("/api/v1/journal", {
    nendo: "2020",
    date: "20210301",
    karikata_cd: "AAAAA",
    karikata_value: 100,
    kasikata_cd: "BBBBB",
    kasikata_value: 100,
    checked: "0",
  });
  expect(result.data.success).toEqual(true);
  const newData = await client.get(`/api/v1/journal/${result.data.id}`);
  expect(newData.data.id).toEqual(result.data.id);
});
