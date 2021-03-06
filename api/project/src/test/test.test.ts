import { testServer } from "@test/testServer";

beforeAll(async () => {
  await testServer.start();
});

afterAll(() => {
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
