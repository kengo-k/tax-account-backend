import { testServer } from "@test/testServer";

test("papi/init", async () => {
  const client = testServer.getClient();
  const apiPath = "/papi/v1/init";
  const selectResult = await client.get(apiPath, {});
  expect(selectResult.data.body).toBeTruthy();
  expect(selectResult.data.body.nendoList.length).toBeGreaterThan(1);
  expect(selectResult.data.body.kamokuMasterList.length).toBeGreaterThan(1);
  expect(selectResult.data.body.saimokuMasterList.length).toBeGreaterThan(1);
});
