import { SaimokuCodeConst } from "@common/constant/saimoku";
import { getContainer } from "@core/container/getContainer";
import { TYPES } from "@core/container/types";
import { SaimokuService } from "@services/master/SaimokuService";
import { ApplicationContext, Env } from "@core/ApplicationContext";
import { ConnectionProvider } from "@core/connection/ConnectionProvider";

import "@core/loadExtensions";

beforeAll(() => {
  ApplicationContext.setEnv(Env.test);
});
afterAll(() => {
  const conn = getContainer().get<ConnectionProvider>(TYPES.SaimokuService);
  conn.getConnection().close();
});

test("service/saimoku", async () => {
  const service = getContainer().get<SaimokuService>(TYPES.SaimokuService);
  const result = await service.selectSaimokuDetail({
    saimoku_cd: SaimokuCodeConst.CASH,
  });
  expect(result.length).toEqual(1);
  expect(result[0].kamoku_cd).toBeDefined();
  expect(result[0].saimoku_cd).toBeDefined();
  expect(result[0].kamoku_bunrui_type).toBeDefined();
});
