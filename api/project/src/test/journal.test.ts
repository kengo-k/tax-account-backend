import { testServer } from "@test/testServer";

test("journals logic", async () => {
  const client = testServer.getClient();
  const apiPath = "/api/v1/journal";
  // error test: insert without date
  const insertResult = await client.post(apiPath, {
    nendo: "2020",
    //date: "20210301",
    karikata_cd: "AAAAA",
    karikata_value: 100,
    kasikata_cd: "BBBBB",
    kasikata_value: 100,
    note: "note1",
    checked: "0",
  });
  expect(insertResult.data.success).toBeFalsy();
});
