import { getContainer } from "@core/container/getContainer";
import { TYPES } from "@core/container/types";
import { JournalController } from "@controllers/journal/JournalController";

export enum API_METHOD {
  GET,
  POST,
  PUT,
  DELETE,
}

export interface Route<CONTROLLER> {
  method: API_METHOD;
  path: string;
  controller: CONTROLLER;
  run: (req: any, res: any) => void;
}

const routes: Route<any>[] = [];
const addRoute = <CONTROLLER>(
  method: API_METHOD,
  path: string,
  controller: CONTROLLER,
  // TODO anyやめる
  createRun: (controller: CONTROLLER) => (req: any, res: any) => void
) => {
  const run = createRun(controller);
  const route: Route<CONTROLLER> = {
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
  addRoute(GET, "/api/v1/journal/:id", container.get<JournalController>(TYPES.JournalController), (controller) => controller.selectById);
  addRoute(POST, "/api/v1/journal", container.get<JournalController>(TYPES.JournalController), (controller) => controller.create);
}

buildRoute();
export { routes };
