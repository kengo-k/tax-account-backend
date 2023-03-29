import { testServer } from "@test/testServer";
import { DefaultNendo, getDefaultDate } from "@test/testConstant";
import { SaimokuCodeConst as SC } from "@common/constant/saimoku";

test("journal/crud", async () => {
  const client = testServer.getClient();
  const apiPath = "/api/v1/journal";

  // error test: insert without date
  const insertResult = await client.post(apiPath, {
    nendo: DefaultNendo,
    //date: "20210301",
    karikata_cd: SC.CASH,
    karikata_value: 100,
    kasikata_cd: SC.SALES,
    kasikata_value: 100,
    note: "note1",
    checked: "0",
  });
  expect(insertResult.data.success).toBeFalsy();
  expect(insertResult.status).toEqual(400);

  // error test :insert with specified id
  const insertResult2 = await client.post(apiPath, {
    id: 999,
    nendo: DefaultNendo,
    date: getDefaultDate(),
    karikata_cd: SC.CASH,
    karikata_value: 100,
    kasikata_cd: SC.SALES,
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
    date: getDefaultDate(),
  });
  expect(updateResult.data.success).toBeFalsy();
  expect(updateResult.status).toEqual(404);

  // error test: delete with not exist id
  const deleteResult = await client.delete(`${apiPath}/${-1}`);
  expect(deleteResult.data.success).toBeFalsy();
  expect(deleteResult.status).toEqual(404);
});
