import * as express from "express";
import * as bodyParser from "body-parser";
import { routes, API_METHOD, Route } from "./routes";
import "@core/loadExtensions";

// CORS対応
const allowCrossDomain = (
  req: express.Request<any>,
  res: express.Response<any>,
  next: () => void
) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
};

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(allowCrossDomain);

const { GET, POST, PUT, DELETE } = API_METHOD;
for (const route of routes) {
  switch (route.method) {
    case GET:
      app.get(route.path, (req, res) => run(route)(req, res));
      break;
    case POST:
      app.post(route.path, (req, res) => run(route)(req, res));
      break;
    case PUT:
      app.put(route.path, (req, res) => run(route)(req, res));
      break;
    case DELETE:
      app.delete(route.path, (req, res) => run(route)(req, res));
      break;
  }
}

const run = (route: Route) => (req: express.Request, res: express.Response) => {
  route.run.bind(route.controller)(req, res);
};

export { app };
