import { testServer } from "@test/testServer";
import { AxiosInstance } from "axios";
import { SaimokuCodeConst } from "@common/constant/saimoku";

const insertApiPath = "/api/v1/journal";
const selectApiPath = "/api/v1/ledger";

const createInsert = (client: AxiosInstance) => (nendo: string) => async (
  date: string,
  karikata_cd: string,
  kasikata_cd: string,
  value: number
) => {
  return await client.post(insertApiPath, {
    nendo,
    date,
    karikata_cd,
    karikata_value: value,
    kasikata_cd,
    kasikata_value: value,
    checked: "0",
  });
};

const createSelect = (client: AxiosInstance) => async (
  nendo: string,
  target_cd: string
) => {
  const path = `${selectApiPath}/${nendo}/${target_cd}`;
  return await client.get(path);
};

const SC = SaimokuCodeConst;
test("test ledger basic", async () => {
  const client = testServer.getClient();
  const insert = createInsert(client)("2021");
  const select = createSelect(client);
  await insert("20210401", SC.CASH, SC.SALES, 100);
  await insert("20210402", SC.CASH, SC.SALES, 200);
  const result1 = await select("2021", SC.CASH);
  expect(result1.data.body.length).toEqual(2);
  expect(result1.data.body[0].karikata_sum).toEqual(300);
  expect(result1.data.body[0].kasikata_sum).toEqual(0);
  await insert("20210403", SC.MISC, SC.CASH, 50);
  await insert("20210404", SC.MISC, SC.CASH, 20);
  const result2 = await select("2021", SC.CASH);
  const result3 = await select("2021", SC.MISC);
  expect(result2.data.body.length).toEqual(4);
  expect(result2.data.body[0].karikata_sum).toEqual(300);
  expect(result2.data.body[0].kasikata_sum).toEqual(70);
  console.log(result3.data.body);
});
