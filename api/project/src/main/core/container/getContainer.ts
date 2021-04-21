import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "@core/container/types";
import { ConnectionProvider } from "@core/connection/ConnectionProvider";
import { JournalService } from "@services/journal/JournalService";
import { MasterService } from "@services/master/MasterService";
import { JournalController } from "@controllers/journal/JournalController";
import { MasterController } from "@controllers/master/MasterController";
import { PresentationController } from "@controllers/presentation/PresentationController";

// prettier-ignore
const createContainer = () => {
  const container = new Container();
  container.bind<ConnectionProvider>(TYPES.ConnectionProvider).to(ConnectionProvider).inSingletonScope();
  container.bind<JournalController>(TYPES.JournalController).to(JournalController);
  container.bind<MasterController>(TYPES.MasterController).to(MasterController);
  container.bind<PresentationController>(TYPES.PresentationController).to(PresentationController);
  container.bind<JournalService>(TYPES.JournalService).to(JournalService);
  container.bind<MasterService>(TYPES.MasterService).to(MasterService);
  return container;
}

const container = createContainer();

const getContainer = () => {
  return container;
};

export { getContainer };
