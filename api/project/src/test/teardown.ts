import { testServer } from "@test/testServer";

export default function () {
  // テスト終了後にDB接続を切断する
  const connection = testServer.getConnection();
  connection.close();
  // expressを終了
  testServer.stop();
}
