import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "@core/container/types";
import { ConnectionProvider } from "@core/connection/ConnectionProvider";
import { JournalService } from "@services/journal/JournalService";

const container = new Container();

const getContainer = () => {
  container
    .bind<ConnectionProvider>(TYPES.ConnectionProvider)
    .to(ConnectionProvider);
  container.bind<JournalService>(TYPES.JournalService).to(JournalService);

  return container;
};

export { getContainer };
