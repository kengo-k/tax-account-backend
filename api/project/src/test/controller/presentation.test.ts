import { testServer } from "@test/testServer";

const apiBase = "/papi/v1/init";
test("papi/init", async () => {
  const client = testServer.getClient();
  const selectResult = await client.get(`${apiBase}`);
  expect(selectResult.data.body).toBeTruthy();
  expect(selectResult.data.body.nendoList.length).toBeGreaterThan(1);
  expect(selectResult.data.body.kamokuMasterList.length).toBeGreaterThan(1);
  expect(selectResult.data.body.saimokuMasterList.length).toBeGreaterThan(1);
  expect(selectResult.data.body.ledgerList.length).toEqual(0);

  const selectResult2 = await client.get(`${apiBase}?nendo=2021`);
  expect(selectResult2.data.body).toBeTruthy();
  expect(selectResult2.data.body.nendoList.length).toBeGreaterThan(1);
  expect(selectResult2.data.body.kamokuMasterList.length).toBeGreaterThan(1);
  expect(selectResult2.data.body.saimokuMasterList.length).toBeGreaterThan(1);
  expect(selectResult2.data.body.ledgerList.length).toEqual(0);

  const selectResult3 = await client.get(`${apiBase}?nendo=2021&target_cd=A11`);
  expect(selectResult3.data.body).toBeTruthy();
  expect(selectResult3.data.body.nendoList.length).toBeGreaterThan(1);
  expect(selectResult3.data.body.kamokuMasterList.length).toBeGreaterThan(1);
  expect(selectResult3.data.body.saimokuMasterList.length).toBeGreaterThan(1);
  expect(selectResult3.data.body.ledgerList.length).toBeGreaterThan(1);

  const selectResult4 = await client.get(`${apiBase}?target_cd=A11`);
  expect(selectResult4.data.body).toBeTruthy();
  expect(selectResult4.data.body.nendoList.length).toBeGreaterThan(1);
  expect(selectResult4.data.body.kamokuMasterList.length).toBeGreaterThan(1);
  expect(selectResult4.data.body.saimokuMasterList.length).toBeGreaterThan(1);
  expect(selectResult4.data.body.ledgerList.length).toBeGreaterThan(1);

  const selectResult5 = await client.get(`${apiBase}?nendo=2020&target_cd=A11`);
  expect(selectResult5.data.body).toBeTruthy();
  expect(selectResult5.data.body.nendoList.length).toBeGreaterThan(1);
  expect(selectResult5.data.body.kamokuMasterList.length).toBeGreaterThan(1);
  expect(selectResult5.data.body.saimokuMasterList.length).toBeGreaterThan(1);
  expect(selectResult5.data.body.ledgerList.length).toEqual(0);
});
