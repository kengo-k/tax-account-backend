import { testServer } from "@test/testServer";

test("test", async () => {
  await testServer.start();
  testServer.stop();
});
