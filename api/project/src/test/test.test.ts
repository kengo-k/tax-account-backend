import { testServer } from "@test/testServer";

test("test", async () => {
  await testServer.start();
  const client = testServer.getClient();
  const result = await client.post("/api/v1/journal");
  expect(result.data).toEqual({ result: 5 });
  testServer.stop();
});
