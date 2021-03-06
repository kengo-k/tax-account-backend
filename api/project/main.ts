import * as express from "express";
import * as bodyParser from "body-parser";
import { routes, API_METHOD, Route } from "./routes";
import { TYPES } from "@core/container/types";
import { getContainer } from "@core/container/getContainer";
import { NendoService } from "@services/nendo/NendoService";
import { ConnectionProvider } from "@core/connection/ConnectionProvider";
import { JournalEntity } from "@model/journal/JournalEntity";
import { TreatNull } from "@services/BaseService";

// const container = getContainer();

// const connectionProvider = container.get<ConnectionProvider>(
//   TYPES.ConnectionProvider
// );
// const connection = connectionProvider.getConnection();
// connection.connect();

// const nendoService = container.get<NendoService>(TYPES.NendoService);
// const nendoList = nendoService.selectNendoList();
// nendoList.then((value) => {
//   console.log(value);
// });

// const entity = new JournalEntity({
//   date: "20210305",
//   checked: "0",
//   karikata_cd: "AAAAA",
//   karikata_value: 100,
//   kasikata_cd: "BBBBB",
//   kasikata_value: 100,
//   nendo: "2020",
//   note: undefined,
// });
// nendoService.create({
//   entity,
//   treatNull: TreatNull.DefaultIgnore,
//   ignoreRows: [],
//   nullRows: [],
// });

const server = express();
// TODO コンフィグ化する
const port = 8080;

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

const { GET, POST, PUT, DELETE } = API_METHOD;
for (const route of routes) {
  switch (route.method) {
    case GET:
      server.get(route.path, (req, res) => route.run(req, res));
      break;
    case POST:
      server.post(route.path, (req, res) => route.run(req, res));
      break;
    case PUT:
      server.put(route.path, (req, res) => route.run(req, res));
      break;
    case DELETE:
      server.delete(route.path, (req, res) => route.run(req, res));
      break;
  }
}
server.listen(port, () => {
  console.log(`server started at account_api:${port}`);
});
