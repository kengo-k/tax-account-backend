import { testServer } from "@test/testServer";

beforeAll(async () => {
  await testServer.start();
});

afterAll(() => {
  testServer.stop();
});

test("test", async () => {
  const client = testServer.getClient();
  const result = await client.post("/api/v1/journal");
  expect(result.data).toEqual({ result: 5 });
});
