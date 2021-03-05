import { TYPES } from "@core/container/types";
import { getContainer } from "@core/container/getContainer";
import { NendoService } from "@services/nendo/NendoService";
import { ConnectionProvider } from "@core/connection/ConnectionProvider";

const container = getContainer();

const connectionProvider = container.get<ConnectionProvider>(
  TYPES.ConnectionProvider
);
const connection = connectionProvider.getConnection();
connection.connect();

const nendoService = container.get<NendoService>(TYPES.NendoService);
const nendoList = nendoService.selectNendoList();
nendoList.then((value) => {
  console.log(value);
  connection.end();
});
