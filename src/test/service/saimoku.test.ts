import { ApplicationContext, Env } from "@core/ApplicationContext";
import { ConnectionProvider } from "@core/connection/ConnectionProvider";
import { getContainer } from "@core/container/getContainer";
import { TYPES } from "@core/container/types";
import { SaimokuCodeConst } from "@kengo-k/account-common/constant/saimoku";
import { MasterService } from "@services/master/MasterService";

import "@core/loadExtensions";

beforeAll(() => {
  ApplicationContext.setEnv(Env.test);
});
afterAll(() => {
  const conn = getContainer().get<ConnectionProvider>(TYPES.ConnectionProvider);
  conn.getConnection().close();
});

test("service/kamoku/list", async () => {
  const service = getContainer().get<MasterService>(TYPES.MasterService);
  const result = await service.selectKamokuList();
  expect(result).toBeDefined();
});

test("service/saimoku/detail", async () => {
  const service = getContainer().get<MasterService>(TYPES.MasterService);
  const result = await service.selectSaimokuDetail({
    saimoku_cd: SaimokuCodeConst.CASH,
  });
  expect(result.length).toEqual(1);
  expect(result[0].kamoku_cd).toBeDefined();
  expect(result[0].saimoku_cd).toBeDefined();
  expect(result[0].kamoku_bunrui_type).toBeDefined();
});
