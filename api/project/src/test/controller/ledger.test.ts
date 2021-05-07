import { testServer } from "@test/testServer";
import { AxiosInstance } from "axios";
import {
  LedgerNendo,
  getLedgerDate,
  LedgerCdSet1 as CdSet,
} from "@test/testConstant";

const journalApiPath = "/api/v1/journal";
const ledgerApiPath = "/api/v1/ledger";
const initApiPath = "/papi/v1/init";

const getCreateJournal = (client: AxiosInstance) => (nendo: string) => async (
  date: string,
  karikata_cd: string,
  kasikata_cd: string,
  value: number
) => {
  return await client.post(journalApiPath, {
    nendo,
    date,
    karikata_cd,
    karikata_value: value,
    kasikata_cd,
    kasikata_value: value,
    checked: "0",
  });
};

const getCreateLedger = (client: AxiosInstance) => (nendo: string) => async (
  date: string,
  ledger_cd: string,
  other_cd: string,
  karikata_value: number | null,
  kasikata_value: number | null,
  note: string | undefined
) => {
  const path = `${ledgerApiPath}`;
  return await client.post(path, {
    nendo,
    date,
    ledger_cd,
    other_cd,
    karikata_value,
    kasikata_value,
    note,
  });
};

const getUpdateLedger = (client: AxiosInstance) => (nendo: string) => async (
  id: number,
  date: string | undefined,
  ledger_cd: string,
  other_cd: string,
  karikata_value: number | null,
  kasikata_value: number | null,
  note: string | undefined
) => {
  const path = `${ledgerApiPath}`;
  return await client.put(path, {
    id,
    nendo,
    date,
    ledger_cd,
    other_cd,
    karikata_value,
    kasikata_value,
    note,
  });
};

const createSelect = (client: AxiosInstance) => async (
  nendo: string,
  target_cd: string
) => {
  const path = `${ledgerApiPath}/${nendo}/${target_cd}`;
  return await client.get(path);
};

test("ledger/select", async () => {
  const client = testServer.getClient();
  const insert = getCreateJournal(client)(LedgerNendo);
  const select = createSelect(client);

  await insert(getLedgerDate(), CdSet.URIKAKE, CdSet.SALES, 500000);
  await insert(getLedgerDate(1), CdSet.URIKAKE, CdSet.SALES, 600000);

  const result1 = await select(LedgerNendo, CdSet.URIKAKE);
  expect(result1.data.body.length).toEqual(2);
  expect(result1.data.body[0].karikata_sum).toEqual(1100000);
  expect(result1.data.body[0].kasikata_sum).toEqual(0);
  expect(result1.data.body[0].acc).toEqual(1100000);

  await insert(getLedgerDate(2), CdSet.DEPOSIT, CdSet.URIKAKE, 500000);
  await insert(getLedgerDate(3), CdSet.DEPOSIT, CdSet.URIKAKE, 600000);

  const result2 = await select(LedgerNendo, CdSet.URIKAKE);
  expect(result2.data.body.length).toEqual(4);
  expect(result2.data.body[0].karikata_sum).toEqual(1100000);
  expect(result2.data.body[0].kasikata_sum).toEqual(1100000);
  expect(result2.data.body[0].acc).toEqual(0);

  const result3 = await select(LedgerNendo, CdSet.SALES);
  expect(result3.data.body.length).toEqual(2);
  expect(result3.data.body[0].acc).toEqual(1100000);

  const result4 = await select(LedgerNendo, CdSet.DEPOSIT);
  expect(result4.data.body.length).toEqual(2);
  expect(result4.data.body[0].acc).toEqual(1100000);
});

test("papi/init", async () => {
  const client = testServer.getClient();
  const selectResult = await client.get(`${initApiPath}`);
  expect(selectResult.data.body).toBeTruthy();
  expect(selectResult.data.body.nendoList.length).toBeGreaterThan(1);
  expect(selectResult.data.body.kamokuMasterList.length).toBeGreaterThan(1);
  expect(selectResult.data.body.saimokuMasterList.length).toBeGreaterThan(1);
  expect(selectResult.data.body.ledgerList.length).toEqual(0);

  const selectResult2 = await client.get(`${initApiPath}?nendo=${LedgerNendo}`);
  expect(selectResult2.data.body).toBeTruthy();
  expect(selectResult2.data.body.nendoList.length).toBeGreaterThan(1);
  expect(selectResult2.data.body.kamokuMasterList.length).toBeGreaterThan(1);
  expect(selectResult2.data.body.saimokuMasterList.length).toBeGreaterThan(1);
  expect(selectResult2.data.body.ledgerList.length).toEqual(0);

  // prettier-ignore
  const selectResult3 = await client.get(`${initApiPath}?nendo=${LedgerNendo}&target_cd=${CdSet.URIKAKE}`);
  expect(selectResult3.data.body).toBeTruthy();
  expect(selectResult3.data.body.nendoList.length).toBeGreaterThan(1);
  expect(selectResult3.data.body.kamokuMasterList.length).toBeGreaterThan(1);
  expect(selectResult3.data.body.saimokuMasterList.length).toBeGreaterThan(1);
  expect(selectResult3.data.body.ledgerList.length).toBeGreaterThan(0);

  // prettier-ignore
  const selectResult4 = await client.get(`${initApiPath}?target_cd=${CdSet.URIKAKE}`);
  expect(selectResult4.data.body).toBeTruthy();
  expect(selectResult4.data.body.nendoList.length).toBeGreaterThan(1);
  expect(selectResult4.data.body.kamokuMasterList.length).toBeGreaterThan(1);
  expect(selectResult4.data.body.saimokuMasterList.length).toBeGreaterThan(1);
  expect(selectResult4.data.body.ledgerList.length).toBeGreaterThan(0);
});

test("ledger/create-update", async () => {
  const client = testServer.getClient();
  const insert = getCreateLedger(client)(LedgerNendo);
  const update = getUpdateLedger(client)(LedgerNendo);

  const insertResult1 = await insert(
    getLedgerDate(30),
    CdSet.URIKAKE,
    CdSet.SALES,
    650000,
    null,
    undefined
  );
  expect(insertResult1.data.body).toBeTruthy();
  expect(insertResult1.data.body.karikata_cd).toEqual(CdSet.URIKAKE);
  expect(insertResult1.data.body.kasikata_cd).toEqual(CdSet.SALES);
  expect(insertResult1.data.body.kasikata_value).toEqual(650000);
  expect(insertResult1.data.body.kasikata_value).toEqual(650000);

  const updateResult1 = await update(
    insertResult1.data.body.id,
    undefined,
    CdSet.URIKAKE,
    CdSet.SALES,
    650000,
    null,
    "note1"
  );

  expect(updateResult1.data.body).toBeTruthy();
  expect(updateResult1.data.body.id).toEqual(insertResult1.data.body.id);
  expect(updateResult1.data.body.date).toEqual(getLedgerDate(30));
  expect(updateResult1.data.body.karikata_cd).toEqual(CdSet.URIKAKE);
  expect(updateResult1.data.body.kasikata_cd).toEqual(CdSet.SALES);
  expect(updateResult1.data.body.kasikata_value).toEqual(650000);
  expect(updateResult1.data.body.kasikata_value).toEqual(650000);
  expect(updateResult1.data.body.note).toEqual("note1");

  const updateResult2 = await update(
    insertResult1.data.body.id,
    undefined,
    CdSet.URIKAKE,
    CdSet.SALES,
    700000,
    null,
    "note1"
  );

  expect(updateResult2.data.body).toBeTruthy();
  expect(updateResult2.data.body.date).toEqual(getLedgerDate(30));
  expect(updateResult2.data.body.karikata_cd).toEqual(CdSet.URIKAKE);
  expect(updateResult2.data.body.kasikata_cd).toEqual(CdSet.SALES);
  expect(updateResult2.data.body.kasikata_value).toEqual(700000);
  expect(updateResult2.data.body.kasikata_value).toEqual(700000);
  expect(updateResult2.data.body.note).toEqual("note1");

  const updateResult3 = await update(
    insertResult1.data.body.id,
    getLedgerDate(31),
    CdSet.URIKAKE,
    CdSet.SALES,
    null,
    300000,
    "note2"
  );

  expect(updateResult3.data.body).toBeTruthy();
  expect(updateResult3.data.body.date).toEqual(getLedgerDate(31));
  expect(updateResult3.data.body.karikata_cd).toEqual(CdSet.SALES);
  expect(updateResult3.data.body.kasikata_cd).toEqual(CdSet.URIKAKE);
  expect(updateResult3.data.body.kasikata_value).toEqual(300000);
  expect(updateResult3.data.body.kasikata_value).toEqual(300000);
  expect(updateResult3.data.body.note).toEqual("note2");
});
