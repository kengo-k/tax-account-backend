import { InitSearchResponse } from "@kengo-k/account-common/model/presentation/InitSearchResponse";
import {
  getLedgerDate,
  LedgerCdSet1 as CdSet,
  LedgerNendo,
} from "@test/testConstant";
import { testServer } from "@test/testServer";
import { AxiosInstance } from "axios";

const journalApiPath = "/api/v1/journal";
const journalsApiPath = "/api/v1/journals";
const ledgerApiPath = "/api/v1/ledger";
const initApiPath = "/papi/v1/init";

const getCreateJournal =
  (client: AxiosInstance) =>
  (nendo: string) =>
  async (
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

const getCreateLedger =
  (client: AxiosInstance) =>
  (nendo: string) =>
  async (
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

const getUpdateLedger =
  (client: AxiosInstance) =>
  async (
    id: number,
    ledger_cd: string,
    other_cd: string,
    karikata_value: number | null,
    kasikata_value: number | null
  ) => {
    const path = `${ledgerApiPath}/${id}`;
    return await client.put(path, {
      ledger_cd,
      other_cd,
      karikata_value,
      kasikata_value,
    });
  };

const createSelectLedger =
  (client: AxiosInstance) =>
  async (
    nendo: string,
    ledger_cd: string,
    month?: string,
    page_no?: number,
    page_size?: number
  ) => {
    page_no = page_no == null ? 1 : page_no;
    page_size = page_size == null ? 10 : page_size;
    const query = [];
    if (month != null) {
      query.push(`month=${month}`);
    }
    query.push(`page_no=${page_no}`);
    query.push(`page_size=${page_size}`);
    const path = `${ledgerApiPath}/${nendo}/${ledger_cd}${
      query.length === 0 ? "" : `?${query.join("&")}`
    }`;
    return await client.get(path);
  };

const createSelectJournals =
  (client: AxiosInstance) =>
  async (nendo: string, page_no?: number, page_size?: number) => {
    const query = [];
    if (page_no != null) {
      query.push(`page_no=${page_no}`);
    }
    if (page_size != null) {
      query.push(`page_size=${page_size}`);
    }
    const path = `${journalsApiPath}/${nendo}${
      query.length === 0 ? "" : `?${query.join("&")}`
    }`;
    return await client.get(path);
  };

test("ledger/select", async () => {
  const client = testServer.getClient();
  const insert = getCreateJournal(client)(LedgerNendo);
  const selectLedger = createSelectLedger(client);
  const selectJournals = createSelectJournals(client);

  await insert(getLedgerDate(), CdSet.URIKAKE, CdSet.SALES, 500000);
  await insert(getLedgerDate(1), CdSet.URIKAKE, CdSet.SALES, 600000);

  const result1 = await selectLedger(LedgerNendo, CdSet.URIKAKE);
  expect(result1.data.body.list.length).toEqual(2);
  expect(result1.data.body.list[0].karikata_sum).toEqual(1100000);
  expect(result1.data.body.list[0].kasikata_sum).toEqual(0);
  expect(result1.data.body.list[0].acc).toEqual(1100000);

  await insert(getLedgerDate(2), CdSet.DEPOSIT, CdSet.URIKAKE, 500000);
  await insert(getLedgerDate(40), CdSet.DEPOSIT, CdSet.URIKAKE, 600000);

  const result2 = await selectLedger(LedgerNendo, CdSet.URIKAKE);
  expect(result2.data.body.list.length).toEqual(4);
  expect(result2.data.body.list[0].karikata_sum).toEqual(1100000);
  expect(result2.data.body.list[0].kasikata_sum).toEqual(1100000);
  expect(result2.data.body.list[0].acc).toEqual(0);

  const result3 = await selectLedger(LedgerNendo, CdSet.SALES);
  expect(result3.data.body.list.length).toEqual(2);
  expect(result3.data.body.list[0].acc).toEqual(1100000);

  const result4 = await selectLedger(LedgerNendo, CdSet.DEPOSIT);
  expect(result4.data.body.list.length).toEqual(2);
  expect(result4.data.body.list[0].acc).toEqual(1100000);

  const monthSelectResult1 = await selectLedger(
    LedgerNendo,
    CdSet.DEPOSIT,
    "04"
  );
  expect(monthSelectResult1.data.body.list).toBeDefined();
  expect(monthSelectResult1.data.body.list.length).toEqual(1);

  const monthSelectResult2 = await selectLedger(
    LedgerNendo,
    CdSet.DEPOSIT,
    "05"
  );
  expect(monthSelectResult2.data.body.list).toBeDefined();
  expect(monthSelectResult2.data.body.list.length).toEqual(1);
  expect(monthSelectResult2.data.body.list[0].acc).toEqual(1100000);

  const monthSelectResult3 = await selectLedger(
    LedgerNendo,
    CdSet.DEPOSIT,
    "06"
  );
  expect(monthSelectResult3.data.body.list).toBeDefined();
  expect(monthSelectResult3.data.body.list.length).toEqual(0);

  const s1 = await selectJournals(LedgerNendo, 1, 3);
  expect(s1.data.body.list).toBeDefined();
  expect(s1.data.body.list.length).toEqual(3);

  const s2 = await selectJournals(LedgerNendo, 1, 4);
  expect(s2.data.body.list).toBeDefined();
  expect(s2.data.body.list.length).toEqual(4);

  const s3 = await selectJournals(LedgerNendo, 1, 5);
  expect(s3.data.body.list).toBeDefined();
  expect(s3.data.body.list.length).toEqual(4);

  const s4 = await selectJournals(LedgerNendo, 1, 1);
  expect(s4.data.body.list).toBeDefined();
  expect(s4.data.body.list.length).toEqual(1);

  const s5 = await selectJournals(LedgerNendo, 2, 1);
  expect(s5.data.body.list).toBeDefined();
  expect(s5.data.body.list.length).toEqual(1);

  const s6 = await selectJournals(LedgerNendo, 3, 1);
  expect(s6.data.body.list).toBeDefined();
  expect(s6.data.body.list.length).toEqual(1);

  const s7 = await selectJournals(LedgerNendo, 4, 1);
  expect(s7.data.body.list).toBeDefined();
  expect(s7.data.body.list.length).toEqual(1);

  const s8 = await selectJournals(LedgerNendo, 5, 1);
  expect(s8.data.body.list).toBeDefined();
  expect(s8.data.body.list.length).toEqual(0);
});

const getSelectInit =
  (client: AxiosInstance) =>
  async (nendo: string | undefined, ledger_cd: string | undefined) => {
    const querys = [];
    if (nendo != null) {
      querys.push(`nendo=${nendo}`);
    }
    if (ledger_cd != null) {
      querys.push(`ledger_cd=${ledger_cd}`);
    }
    return await client.get<{ body: InitSearchResponse }>(
      `${initApiPath}${querys.length === 0 ? "" : `?${querys.join("&")}`}`
    );
  };

test("papi/init", async () => {
  const client = testServer.getClient();
  const select = getSelectInit(client);
  const selectResult = await select(undefined, undefined);
  expect(selectResult.data.body).toBeTruthy();
  expect(selectResult.data.body.nendo_list.length).toBeGreaterThan(1);
  expect(selectResult.data.body.kamoku_list.length).toBeGreaterThan(1);
  expect(selectResult.data.body.saimoku_list.length).toBeGreaterThan(1);

  const selectResult2 = await select(LedgerNendo, undefined);
  expect(selectResult2.data.body).toBeTruthy();
  expect(selectResult2.data.body.nendo_list.length).toBeGreaterThan(1);
  expect(selectResult2.data.body.kamoku_list.length).toBeGreaterThan(1);
  expect(selectResult2.data.body.saimoku_list.length).toBeGreaterThan(1);

  // prettier-ignore
  const selectResult3 = await select(LedgerNendo, CdSet.URIKAKE);
  expect(selectResult3.data.body).toBeTruthy();
  expect(selectResult3.data.body.nendo_list.length).toBeGreaterThan(1);
  expect(selectResult3.data.body.kamoku_list.length).toBeGreaterThan(1);
  expect(selectResult3.data.body.saimoku_list.length).toBeGreaterThan(1);

  // prettier-ignore
  const selectResult4 = await select(undefined, CdSet.URIKAKE);
  expect(selectResult4.data.body).toBeTruthy();
  expect(selectResult4.data.body.nendo_list.length).toBeGreaterThan(1);
  expect(selectResult4.data.body.kamoku_list.length).toBeGreaterThan(1);
  expect(selectResult4.data.body.saimoku_list.length).toBeGreaterThan(1);
});

test("ledger/create-update", async () => {
  const client = testServer.getClient();
  const insert = getCreateLedger(client)(LedgerNendo);
  const update = getUpdateLedger(client);

  const insertResult1 = await insert(
    getLedgerDate(30),
    CdSet.URIKAKE,
    CdSet.SALES,
    650000,
    null,
    "note1"
  );
  expect(insertResult1.data.body).toBeTruthy();
  expect(insertResult1.data.body.karikata_cd).toEqual(CdSet.URIKAKE);
  expect(insertResult1.data.body.kasikata_cd).toEqual(CdSet.SALES);
  expect(insertResult1.data.body.kasikata_value).toEqual(650000);
  expect(insertResult1.data.body.kasikata_value).toEqual(650000);
  expect(insertResult1.data.body.note).toEqual("note1");

  const updateResult1 = await update(
    insertResult1.data.body.id,
    CdSet.URIKAKE,
    CdSet.SALES,
    700000,
    null
  );

  expect(updateResult1.data.body).toBeTruthy();
  expect(updateResult1.data.body.id).toEqual(insertResult1.data.body.id);
  expect(updateResult1.data.body.date).toEqual(getLedgerDate(30));
  expect(updateResult1.data.body.karikata_cd).toEqual(CdSet.URIKAKE);
  expect(updateResult1.data.body.kasikata_cd).toEqual(CdSet.SALES);
  expect(updateResult1.data.body.kasikata_value).toEqual(700000);
  expect(updateResult1.data.body.kasikata_value).toEqual(700000);
  expect(updateResult1.data.body.note).toEqual("note1");

  const updateResult2 = await update(
    insertResult1.data.body.id,
    CdSet.URIKAKE,
    CdSet.SALES,
    null,
    300000
  );

  expect(updateResult2.data.body).toBeTruthy();
  expect(updateResult2.data.body.date).toEqual(getLedgerDate(30));
  expect(updateResult2.data.body.karikata_cd).toEqual(CdSet.SALES);
  expect(updateResult2.data.body.kasikata_cd).toEqual(CdSet.URIKAKE);
  expect(updateResult2.data.body.kasikata_value).toEqual(300000);
  expect(updateResult2.data.body.kasikata_value).toEqual(300000);
  expect(updateResult2.data.body.note).toEqual("note1");
});
