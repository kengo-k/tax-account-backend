import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "@core/container/types";
import { ConnectionProvider } from "@core/connection/ConnectionProvider";
import { JournalService } from "@services/journal/JournalService";
import { SaimokuService } from "@services/master/SaimokuService";
import { NendoService } from "@services/nendo/NendoService";
import { JournalController } from "@controllers/journal/JournalController";
import { MasterController } from "@controllers/master/MasterController";

// prettier-ignore
const createContainer = () => {
  const container = new Container();
  container.bind<ConnectionProvider>(TYPES.ConnectionProvider).to(ConnectionProvider).inSingletonScope();
  container.bind<JournalController>(TYPES.JournalController).to(JournalController);
  container.bind<JournalService>(TYPES.JournalService).to(JournalService);
  container.bind<MasterController>(TYPES.MasterController).to(MasterController);
  container.bind<SaimokuService>(TYPES.SaimokuService).to(SaimokuService);
  container.bind<NendoService>(TYPES.NendoService).to(NendoService);
  return container;
}

const container = createContainer();

const getContainer = () => {
  return container;
};

export { getContainer };
