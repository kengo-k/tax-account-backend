import { testServer } from "@test/testServer";
import { DefaultNendo, getDefaultDate } from "@test/testConstant";
import { SaimokuCodeConst as SC } from "@common/constant/saimoku";

test("basic CRUD functions", async () => {
  const client = testServer.getClient();
  const apiPath = "/api/v1/journal";

  // insert
  const insertResult = await client.post(apiPath, {
    nendo: DefaultNendo,
    date: getDefaultDate(),
    karikata_cd: SC.CASH,
    karikata_value: 100,
    kasikata_cd: SC.SALES,
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
    date: getDefaultDate(1),
  });
  expect(updateResult.data.body.date).toEqual(getDefaultDate(1));
  expect(updateResult.data.body.note).toEqual("note1");

  // update with null
  // prettier-ignore
  const updateResult2 = await client.put(`${apiPath}/${insertResult.data.body.id}`, {
    note: null,
  });
  expect(updateResult2.data.body.note).toBeNull();

  // delete
  // prettier-ignore
  const deleteResult = await client.delete(`${apiPath}/${insertResult.data.body.id}`);
  expect(deleteResult.data.body).toBeTruthy();
  expect(deleteResult.data.body.id).toEqual(insertResult.data.body.id);

  // select after delete
  // prettier-ignore
  const selectResult2 = await client.get(`${apiPath}/${insertResult.data.body.id}`);
  expect(selectResult2.data.success).toBeFalsy();
  expect(selectResult2.status).toEqual(404);
});

test("error", async () => {
  const client = testServer.getClient();
  const apiPath = "/api/v1/journal";
  // 不正なIDを使用
  const selectResult = await client.get(`${apiPath}/xxx`);
  expect(selectResult.data.success).toBeFalsy();
  expect(selectResult.status).toEqual(400);
  expect(selectResult.data.error.HTTP_CODE).toEqual(400);
});
