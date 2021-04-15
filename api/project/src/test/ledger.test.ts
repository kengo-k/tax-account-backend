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
  expect(result1.data.body[0].acc).toEqual(300);
  await insert("20210403", SC.MISC, SC.CASH, 50);
  await insert("20210404", SC.MISC, SC.CASH, 20);
  const result2 = await select("2021", SC.CASH);
  expect(result2.data.body.length).toEqual(4);
  expect(result2.data.body[0].karikata_sum).toEqual(300);
  expect(result2.data.body[0].kasikata_sum).toEqual(70);
  expect(result2.data.body[0].acc).toEqual(230);
  await insert("20210405", SC.SALARY, SC.UNPAID_SALARY, 50);
  await insert("20210405", SC.SALARY, SC.UNPAID_SALARY, 30);
  const result3 = await select("2021", SC.UNPAID_SALARY);
  expect(result3.data.body.length).toEqual(2);
  expect(result3.data.body[0].acc).toEqual(80);
  await insert("20210406", SC.UNPAID_SALARY, SC.CASH, 80);
  const result4 = await select("2021", SC.CASH);
  const result5 = await select("2021", SC.UNPAID_SALARY);
  const result6 = await select("2021", SC.SALARY);
  expect(result4.data.body.length).toEqual(5);
  expect(result4.data.body[0].acc).toEqual(150);
  expect(result5.data.body.length).toEqual(3);
  expect(result5.data.body[0].acc).toEqual(0);
  expect(result6.data.body.length).toEqual(2);
  expect(result6.data.body[0].acc).toEqual(80);
});
