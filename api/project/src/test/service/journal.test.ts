import { getContainer } from "@core/container/getContainer";
import { TYPES } from "@core/container/types";
import { ApplicationContext, Env } from "@core/ApplicationContext";
import { ConnectionProvider } from "@core/connection/ConnectionProvider";
import { SaimokuCodeConst as SC } from "@common/constant/saimoku";
import { JournalService } from "@services/journal/JournalService";

import "@core/loadExtensions";

beforeAll(() => {
  ApplicationContext.setEnv(Env.test);
});
afterAll(() => {
  const conn = getContainer().get<ConnectionProvider>(TYPES.ConnectionProvider);
  conn.getConnection().close();
});

test("service/ledger/crud", async () => {
  const service = getContainer().get<JournalService>(TYPES.JournalService);
  const result1 = await service.createLedger({
    id: undefined,
    nendo: "2021",
    date: "20210501",
    ledgerCd: SC.CASH,
    anotherCd: SC.MISC,
    karikataValue: 100,
    kasikataValue: undefined,
    note: "",
  });
  expect(result1?.karikata_cd).toEqual(SC.CASH);
  expect(result1?.kasikata_cd).toEqual(SC.MISC);
  expect(result1?.karikata_value).toEqual(100);
  expect(result1?.kasikata_value).toEqual(100);

  const result2 = await service.createLedger({
    id: undefined,
    nendo: "2021",
    date: "20210501",
    ledgerCd: SC.UNPAID_SALARY,
    anotherCd: SC.MISC,
    karikataValue: undefined,
    kasikataValue: 100,
    note: "",
  });
  expect(result2?.karikata_cd).toEqual(SC.MISC);
  expect(result2?.kasikata_cd).toEqual(SC.UNPAID_SALARY);
  expect(result2?.karikata_value).toEqual(100);
  expect(result2?.kasikata_value).toEqual(100);

  const result3 = await service.createLedger({
    id: undefined,
    nendo: "2021",
    date: "20210501",
    ledgerCd: SC.UNPAID_SALARY,
    anotherCd: SC.CASH,
    karikataValue: 100,
    kasikataValue: undefined,
    note: "",
  });
  expect(result3?.karikata_cd).toEqual(SC.UNPAID_SALARY);
  expect(result3?.kasikata_cd).toEqual(SC.CASH);
  expect(result3?.karikata_value).toEqual(100);
  expect(result3?.kasikata_value).toEqual(100);

  const result4 = await service.updateLedger({
    id: result3?.id as number,
    ledgerCd: SC.UNPAID_SALARY,
    anotherCd: SC.CASH,
    karikataValue: undefined,
    kasikataValue: 200,
  });
  expect(result4?.id).toBeDefined();
  expect(result4?.id).toEqual(result3?.id);
  expect(result4?.karikata_cd).toEqual(SC.CASH);
  expect(result4?.kasikata_cd).toEqual(SC.UNPAID_SALARY);
  expect(result4?.karikata_value).toEqual(200);
  expect(result4?.karikata_value).toEqual(200);
});
