import { getContainer } from "@core/container/getContainer";
import { TYPES } from "@core/container/types";
import { ApplicationContext, Env } from "@core/ApplicationContext";
import { ConnectionProvider } from "@core/connection/ConnectionProvider";
import { JournalService } from "@services/journal/JournalService";
import { SaimokuCodeConst as SC } from "@common/constant/saimoku";
import { DefaultNendo, getDefaultDate, DefaultDate } from "@test/testConstant";

import "@core/loadExtensions";

beforeAll(() => {
  ApplicationContext.setEnv(Env.test);
});
afterAll(() => {
  const conn = getContainer().get<ConnectionProvider>(TYPES.ConnectionProvider);
  conn.getConnection().close();
});

test("ledger/crud", async () => {
  const service = getContainer().get<JournalService>(TYPES.JournalService);
  const result1 = await service.createLedger({
    nendo: DefaultNendo,
    date: getDefaultDate(),
    ledger_cd: SC.CASH,
    other_cd: SC.MISC,
    karikata_value: 100,
    kasikata_value: null,
    note: "",
  });
  expect(result1?.nendo).toEqual(DefaultNendo);
  expect(result1?.date).toEqual(DefaultDate);
  expect(result1?.karikata_cd).toEqual(SC.CASH);
  expect(result1?.kasikata_cd).toEqual(SC.MISC);
  expect(result1?.karikata_value).toEqual(100);
  expect(result1?.kasikata_value).toEqual(100);

  const result2 = await service.createLedger({
    nendo: DefaultNendo,
    date: getDefaultDate(),
    ledger_cd: SC.UNPAID_SALARY,
    other_cd: SC.MISC,
    karikata_value: null,
    kasikata_value: 100,
    note: "",
  });
  expect(result2?.karikata_cd).toEqual(SC.MISC);
  expect(result2?.kasikata_cd).toEqual(SC.UNPAID_SALARY);
  expect(result2?.karikata_value).toEqual(100);
  expect(result2?.kasikata_value).toEqual(100);

  const result3 = await service.createLedger({
    nendo: DefaultNendo,
    date: getDefaultDate(),
    ledger_cd: SC.UNPAID_SALARY,
    other_cd: SC.CASH,
    karikata_value: 100,
    kasikata_value: null,
    note: "",
  });
  expect(result3?.karikata_cd).toEqual(SC.UNPAID_SALARY);
  expect(result3?.kasikata_cd).toEqual(SC.CASH);
  expect(result3?.karikata_value).toEqual(100);
  expect(result3?.kasikata_value).toEqual(100);

  const result4 = await service.updateLedger({
    id: result3?.id as number,
    nendo: DefaultNendo,
    date: undefined,
    ledger_cd: SC.UNPAID_SALARY,
    other_cd: SC.CASH,
    karikata_value: null,
    kasikata_value: 200,
    note: undefined,
  });
  expect(result4?.id).toBeDefined();
  expect(result4?.id).toEqual(result3?.id);
  expect(result4?.karikata_cd).toEqual(SC.CASH);
  expect(result4?.kasikata_cd).toEqual(SC.UNPAID_SALARY);
  expect(result4?.karikata_value).toEqual(200);
  expect(result4?.karikata_value).toEqual(200);
});
