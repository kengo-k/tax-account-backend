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

test("service/neodo", async () => {
  const service = getContainer().get<SaimokuService>(TYPES.SaimokuService);
  const result = await service.selectNendoList();
  expect(result.length).toEqual(2);
  expect(result[0].nendo).toEqual("2020");
  expect(result[1].nendo).toEqual("2019");
});
