import { ApplicationContext, Env } from "@core/ApplicationContext";
import { testServer } from "@test/testServer";
import * as child_process from "child_process";

beforeAll(async () => {
  // DB接続環境をtestに設定する
  ApplicationContext.setEnv(Env.development);
  // テスト開始前にDBへ接続しておく
  testServer.getConnection();
  // テスト前にDBを再作成する
  child_process.execSync("/opt/project/init_test.sh");
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

test("CRUD", async () => {
  const client = testServer.getClient();
  const apiPath = "/api/v1/journal";

  // insert
  const insertResult = await client.post(apiPath, {
    nendo: "2020",
    date: "20210301",
    karikata_cd: "AAAAA",
    karikata_value: 100,
    kasikata_cd: "BBBBB",
    kasikata_value: 100,
    note: "note1",
    checked: "0",
  });
  expect(insertResult.data.body).toBeTruthy();
  expect(insertResult.data.body.note).toEqual("note1");

  // select
  // prettier-ignore
  const selectResult = await client.get(`${apiPath}/${insertResult.data.body.id}`);
  expect(selectResult.data.body.id).toEqual(insertResult.data.body.id);

  // update
  // prettier-ignore
  const updateResult = await client.put(`${apiPath}/${insertResult.data.body.id}`, {
    date: "20210302",
  });
  expect(updateResult.data.body.date).toEqual("20210302");
  expect(updateResult.data.body.note).toEqual("note1");

  // update with null
  // prettier-ignore
  const updateResult2 = await client.put(`${apiPath}/${insertResult.data.body.id}`, {
    note: null,
  });
  expect(updateResult2.data.body.note).toBeNull();

  // delete
  const deleteResult = await client.delete(
    `${apiPath}/${insertResult.data.body.id}`
  );
  expect(deleteResult.data.body).toBeTruthy();
  expect(deleteResult.data.body.id).toEqual(insertResult.data.body.id);

  // select after delete
  // prettier-ignore
  const selectResult2 = await client.get(`${apiPath}/${insertResult.data.body.id}`);
  expect(selectResult2.data.body).toBeNull();
});
