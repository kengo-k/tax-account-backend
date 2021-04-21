import { getContainer } from "@core/container/getContainer";
import { TYPES } from "@core/container/types";
import { MasterService } from "@services/master/MasterService";
import { ApplicationContext, Env } from "@core/ApplicationContext";
import { ConnectionProvider } from "@core/connection/ConnectionProvider";

import "@core/loadExtensions";

beforeAll(() => {
  ApplicationContext.setEnv(Env.test);
});
afterAll(() => {
  const conn = getContainer().get<ConnectionProvider>(TYPES.MasterService);
  conn.getConnection().close();
});

test("service/neodo", async () => {
  const service = getContainer().get<MasterService>(TYPES.MasterService);
  const result = await service.selectNendoList();
  expect(result.length).toEqual(3);
  expect(result[0].nendo).toEqual("2021");
  expect(result[1].nendo).toEqual("2020");
  expect(result[2].nendo).toEqual("2019");
});
