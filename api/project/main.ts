import { TYPES } from "@core/container/types";
import { getContainer } from "@core/container/getContainer";
import { NendoService } from "@services/nendo/NendoService";
import { ConnectionProvider } from "@core/connection/ConnectionProvider";
import { JournalEntity } from "@model/journal/JournalEntity";
import { TreatNull } from "@services/BaseService";

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
});

const entity = new JournalEntity({
  date: "20210305",
  checked: "0",
  karikata_cd: "AAAAA",
  karikata_value: 100,
  kasikata_cd: "BBBBB",
  kasikata_value: 100,
  nendo: "2020",
  note: undefined,
});
nendoService.create({
  entity,
  treatNull: TreatNull.DefaultIgnore,
  ignoreRows: [],
  nullRows: [],
});
