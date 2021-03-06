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
  run: (req: any, res: any) => void;
}

const routes: Route<any>[] = [];
const addRoute = <CONTROLLER>(
  method: API_METHOD,
  path: string,
  controllerClass: new () => CONTROLLER,
  createRun: (controller: CONTROLLER) => (req: any, res: any) => void
) => {
  const controller = new controllerClass();
  const run = createRun(controller);
  const route: Route<CONTROLLER> = {
    method,
    path,
    run,
  };
  routes.push(route);
};

const { GET, POST, PUT, DELETE } = API_METHOD;

// prettier-ignore
function buildRoute() {
  addRoute(POST, "/api/v1/journal", JournalController, (controller) => controller.create);
}

buildRoute();
export { routes };
