import { SaimokuCodeConst as SC } from "@kengo-k/account-common/constant/saimoku";
import { getSummaryDate2, SummaryNendo2 } from "@test/testConstant";
import { testServer } from "@test/testServer";
import { AxiosInstance } from "axios";

const ledgerApiPath = "/api/v1/ledger";
const summaryApiPath = "/papi/v1/summary";

const getSelectSummary = (client: AxiosInstance) => async () => {
  return await client.get(`${summaryApiPath}?nendo=${SummaryNendo2}`);
};

const getCreateLedger =
  (client: AxiosInstance) =>
  async (
    ledger_cd: string,
    other_cd: string,
    karikata_value: number | null,
    kasikata_value: number | null
  ) => {
    const path = `${ledgerApiPath}`;
    return await client.post(path, {
      nendo: SummaryNendo2,
      date: getSummaryDate2(1),
      ledger_cd,
      other_cd,
      karikata_value,
      kasikata_value,
      note: "",
    });
  };

test("pres/summary/select", async () => {
  const client = testServer.getClient();
  const insert = getCreateLedger(client);
  const select = getSelectSummary(client);

  const insertResult1 = await insert(SC.URIKAKE, SC.SALES, 600000, null);
  expect(insertResult1.data.body).toBeDefined();
  await insert(SC.URIKAKE, SC.SALES, 700000, null);
  await insert(SC.CASH, SC.URIKAKE, 600000, null);
  await insert(SC.CASH, SC.URIKAKE, 700000, null);
  await insert(SC.MISC, SC.CASH, 1000, null);
  await insert(SC.MISC, SC.CASH, 5000, null);
  await insert(SC.RENT, SC.CASH, 130000, null);

  const summary = await select();
  expect(summary).toBeDefined();
  expect(summary.data.body.sales).toEqual(1300000);
  expect(summary.data.body.expenses).toEqual(136000);
});
