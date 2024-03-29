import { ApplicationContext, Env } from "@core/ApplicationContext";
import { ConnectionProvider } from "@core/connection/ConnectionProvider";
import { getContainer } from "@core/container/getContainer";
import { TYPES } from "@core/container/types";
import { SaimokuCodeConst as SC } from "@kengo-k/account-common/constant/saimoku";
import { sleep } from "@kengo-k/account-common/misc/sleep";
import { JournalService } from "@services/journal/JournalService";
import { DefaultNendo, getDefaultDate } from "@test/testConstant";

import "@core/loadExtensions";
import { JournalSearchRequest } from "@kengo-k/account-common/model/journal/JournalSearchRequest";

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
    date: getDefaultDate(20),
    ledger_cd: SC.CASH,
    other_cd: SC.MISC,
    karikata_value: 300,
    kasikata_value: null,
    note: "",
  });
  expect(result1?.nendo).toEqual(DefaultNendo);
  expect(result1?.date).toEqual(getDefaultDate(20));
  expect(result1?.karikata_cd).toEqual(SC.CASH);
  expect(result1?.kasikata_cd).toEqual(SC.MISC);
  expect(result1?.karikata_value).toEqual(300);
  expect(result1?.kasikata_value).toEqual(300);

  await sleep(1000);
  const result2 = await service.createLedger({
    nendo: DefaultNendo,
    date: getDefaultDate(10),
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

  await sleep(1000);
  const result3 = await service.createLedger({
    nendo: DefaultNendo,
    date: getDefaultDate(30),
    ledger_cd: SC.UNPAID_SALARY,
    other_cd: SC.CASH,
    karikata_value: 200,
    kasikata_value: null,
    note: "",
  });
  expect(result3?.karikata_cd).toEqual(SC.UNPAID_SALARY);
  expect(result3?.kasikata_cd).toEqual(SC.CASH);
  expect(result3?.karikata_value).toEqual(200);
  expect(result3?.kasikata_value).toEqual(200);

  const result4 = await service.updateLedger({
    id: result3?.id as number,
    ledger_cd: SC.UNPAID_SALARY,
    other_cd: SC.CASH,
    karikata_value: null,
    kasikata_value: 200,
  });
  expect(result4?.id).toBeDefined();
  expect(result4?.id).toEqual(result3?.id);
  expect(result4?.karikata_cd).toEqual(SC.CASH);
  expect(result4?.kasikata_cd).toEqual(SC.UNPAID_SALARY);
  expect(result4?.karikata_value).toEqual(200);
  expect(result4?.karikata_value).toEqual(200);

  const selectResult1 = await service.selectJournals(
    new JournalSearchRequest({ nendo: DefaultNendo })
  );
  expect(selectResult1.list.length).toEqual(3);
  expect(selectResult1.list[0].date).toEqual(getDefaultDate(30));
  expect(selectResult1.list[1].date).toEqual(getDefaultDate(20));
  expect(selectResult1.list[2].date).toEqual(getDefaultDate(10));

  const selectResult2 = await service.selectJournals(
    new JournalSearchRequest({ nendo: DefaultNendo, latest_order: true })
  );
  expect(selectResult2.list.length).toEqual(3);
  expect(selectResult2.list[0].date).toEqual(getDefaultDate(30));
  expect(selectResult2.list[1].date).toEqual(getDefaultDate(10));
  expect(selectResult2.list[2].date).toEqual(getDefaultDate(20));

  const selectResult3 = await service.selectJournals(
    new JournalSearchRequest({ nendo: DefaultNendo, latest_order: false })
  );
  expect(selectResult3.list.length).toEqual(3);
  expect(selectResult3.list[0].date).toEqual(getDefaultDate(20));
  expect(selectResult3.list[1].date).toEqual(getDefaultDate(10));
  expect(selectResult3.list[2].date).toEqual(getDefaultDate(30));

  const selectResult4 = await service.selectJournals(
    new JournalSearchRequest({ nendo: DefaultNendo, largest_order: true })
  );
  expect(selectResult4.list.length).toEqual(3);
  expect(selectResult4.list[0].karikata_value).toEqual(300);
  expect(selectResult4.list[1].karikata_value).toEqual(200);
  expect(selectResult4.list[2].karikata_value).toEqual(100);

  const selectResult5 = await service.selectJournals(
    new JournalSearchRequest({ nendo: DefaultNendo, largest_order: false })
  );
  expect(selectResult5.list.length).toEqual(3);
  expect(selectResult5.list[0].karikata_value).toEqual(100);
  expect(selectResult5.list[1].karikata_value).toEqual(200);
  expect(selectResult5.list[2].karikata_value).toEqual(300);

  const selectResult6 = await service.selectJournals(
    new JournalSearchRequest({
      nendo: DefaultNendo,
      date_from: getDefaultDate(20),
    })
  );
  expect(selectResult6.list.length).toEqual(2);

  const selectResult7 = await service.selectJournals(
    new JournalSearchRequest({
      nendo: DefaultNendo,
      date_from: getDefaultDate(20),
      date_to: getDefaultDate(21),
    })
  );
  expect(selectResult7.list.length).toEqual(1);

  const selectResult8 = await service.selectJournals(
    new JournalSearchRequest({
      nendo: DefaultNendo,
      date_to: getDefaultDate(20),
    })
  );
  expect(selectResult8.list.length).toEqual(2);

  const selectResult9 = await service.selectJournals(
    new JournalSearchRequest({
      nendo: DefaultNendo,
      date_to: getDefaultDate(19),
    })
  );
  expect(selectResult9.list.length).toEqual(1);
});
