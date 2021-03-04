import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "@core/container/types";
import { ConnectionProvider } from "@core/connection/ConnectionProvider";
import { JournalService } from "@services/journal/JournalService";
import { NendoService } from "@services/nendo/NendoService";

const container = new Container();

const getContainer = () => {
  container
    .bind<ConnectionProvider>(TYPES.ConnectionProvider)
    .to(ConnectionProvider)
    .inSingletonScope();
  container.bind<JournalService>(TYPES.JournalService).to(JournalService);
  container.bind<NendoService>(TYPES.NendoService).to(NendoService);

  return container;
};

export { getContainer };
