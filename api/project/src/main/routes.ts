import * as express from "express";
import { getContainer } from "@core/container/getContainer";
import { TYPES } from "@core/container/types";
import { BaseController } from "@controllers/BaseController";
import { JournalController } from "@controllers/journal/JournalController";
import { PresentationController } from "@controllers/presentation/PresentationController";

export enum API_METHOD {
  GET,
  POST,
  PUT,
  DELETE,
}

export interface Route {
  method: API_METHOD;
  path: string;
  controller: BaseController;
  run: (req: any, res: any) => void;
}

const routes: Route[] = [];
const addRoute = <CONTROLLER extends BaseController>(
  method: API_METHOD,
  path: string,
  controller: CONTROLLER,
  // prettier-ignore
  createRun: (controller: CONTROLLER)
   => (req: express.Request<any>, res: express.Response<any>) => void
) => {
  const run = createRun(controller);
  const route: Route = {
    method,
    path,
    controller,
    run,
  };
  routes.push(route);
};

const { GET, POST, PUT, DELETE } = API_METHOD;

// prettier-ignore
function buildRoute() {
  const container = getContainer();

  //
  // core api
  //

  // 仕訳系API
  addRoute(GET, "/api/v1/journals/:nendo", container.get<JournalController>(TYPES.JournalController), (controller) => controller.selectJournals);
  addRoute(GET, "/api/v1/journal/:id", container.get<JournalController>(TYPES.JournalController), (controller) => controller.selectById);
  addRoute(POST, "/api/v1/journal", container.get<JournalController>(TYPES.JournalController), (controller) => controller.create);
  addRoute(PUT, "/api/v1/journal/:id", container.get<JournalController>(TYPES.JournalController), (controller) => controller.update);
  addRoute(DELETE, "/api/v1/journal/:id", container.get<JournalController>(TYPES.JournalController), (controller) => controller.delete);

  // 台帳系API
  addRoute(GET, "/api/v1/ledger/:nendo/:ledger_cd", container.get<JournalController>(TYPES.JournalController), (controller) => controller.selectLedger);
  addRoute(POST, "/api/v1/ledger", container.get<JournalController>(TYPES.JournalController), (controller) => controller.createLedger);
  addRoute(PUT, "/api/v1/ledger/:id", container.get<JournalController>(TYPES.JournalController), (controller) => controller.updateLedger);

  //
  // presentation api
  //
  addRoute(GET, "/papi/v1/init", container.get<PresentationController>(TYPES.PresentationController), (controller) => controller.selectInit);
  addRoute(GET, "/papi/v1/summary", container.get<PresentationController>(TYPES.PresentationController), (controller) => controller.selectSummary);
}

buildRoute();
export { routes };
