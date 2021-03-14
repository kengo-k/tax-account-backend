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
  expect(insertResult.status).toEqual(400);

  // error test :insert with specified id
  const insertResult2 = await client.post(apiPath, {
    id: 999,
    nendo: "2020",
    date: "20210301",
    karikata_cd: "AAAAA",
    karikata_value: 100,
    kasikata_cd: "BBBBB",
    kasikata_value: 100,
    note: "note1",
    checked: "0",
  });
  expect(insertResult2.data.success).toBeFalsy();
  expect(insertResult2.status).toEqual(400);

  // error test: select with not exist id
  const selectResult = await client.get(`${apiPath}/${-1}`);
  expect(selectResult.data.success).toBeFalsy();
  expect(selectResult.status).toEqual(404);

  // error test: update with not exist id
  const updateResult = await client.put(`${apiPath}/${-1}`, {
    date: "20210301",
  });
  expect(updateResult.data.success).toBeFalsy();
  expect(updateResult.status).toEqual(404);

  // error test: delete with not exist id
  const deleteResult = await client.delete(`${apiPath}/${-1}`);
  expect(deleteResult.data.success).toBeFalsy();
  expect(deleteResult.status).toEqual(404);
});
