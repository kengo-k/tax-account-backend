import { getContainer } from "@core/container/getContainer";
import { TYPES } from "@core/container/types";
import { ApplicationContext, Env } from "@core/ApplicationContext";
import { JournalService } from "@services/journal/JournalService";
import { ConnectionProvider } from "@core/connection/ConnectionProvider";
import { SummaryNendo, SummaryDate } from "@test/testConstant";
import { SaimokuCodeConst as SC } from "@common/constant/saimoku";
import { KamokuBunruiCodeConst } from "@common/constant/kamokuBunrui";

import "@core/loadExtensions";

beforeAll(() => {
  ApplicationContext.setEnv(Env.test);
});
afterAll(() => {
  const conn = getContainer().get<ConnectionProvider>(TYPES.ConnectionProvider);
  conn.getConnection().close();
});

test("service/summary", async () => {
  const service = getContainer().get<JournalService>(TYPES.JournalService);
  const insert = async (
    ledger_cd: string,
    other_cd: string,
    karikata_value: number | null,
    kasikata_value: number | null
  ) => {
    await service.createLedger({
      nendo: SummaryNendo,
      date: SummaryDate,
      ledger_cd,
      other_cd,
      karikata_value,
      kasikata_value,
      note: "",
    });
  };

  await insert(SC.URIKAKE, SC.SALES, 600000, null);
  await insert(SC.URIKAKE, SC.SALES, 700000, null);
  await insert(SC.CASH, SC.URIKAKE, 600000, null);
  await insert(SC.CASH, SC.URIKAKE, 700000, null);
  await insert(SC.MISC, SC.CASH, 1000, null);
  await insert(SC.MISC, SC.CASH, 5000, null);
  await insert(SC.RENT, SC.CASH, 130000, null);

  const result1 = await service.summaryKamokuBunrui({
    nendo: SummaryNendo,
    kamoku_bunrui_cd: KamokuBunruiCodeConst.EXPENSES,
  });
  expect(result1).toBeDefined();
  expect(result1.karikata_kamoku_bunrui_sum).toEqual(136000);
  expect(result1.kasikata_kamoku_bunrui_sum).toEqual(0);
  expect(result1.value).toEqual(136000);

  const result2 = await service.summaryKamokuBunrui({
    nendo: SummaryNendo,
    kamoku_bunrui_cd: KamokuBunruiCodeConst.SALES,
  });
  expect(result2.karikata_kamoku_bunrui_sum).toEqual(0);
  expect(result2.kasikata_kamoku_bunrui_sum).toEqual(1300000);
  expect(result2.value).toEqual(1300000);

  const result3 = await service.summaryKamokuBunrui({
    nendo: SummaryNendo,
    kamoku_bunrui_cd: KamokuBunruiCodeConst.ASSETS,
  });
  expect(result3.karikata_kamoku_bunrui_sum).toEqual(2600000);
  expect(result3.kasikata_kamoku_bunrui_sum).toEqual(1436000);
  expect(result3.value).toEqual(1164000);
});
