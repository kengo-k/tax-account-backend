import { ApplicationContext, Env } from "@core/ApplicationContext";
import { app, port } from "./app";

if (process.env.NODE_ENV === Env.production) {
  ApplicationContext.setEnv(Env.production);
} else if (process.env.NODE_ENV === Env.development) {
  ApplicationContext.setEnv(Env.development);
} else {
  ApplicationContext.setEnv(Env.development);
}

let DATABASE = process.env.NODE_ENV;
process.argv.forEach((arg) => {
  const [key, value] = arg.split("=");
  if (key === "--database") {
    DATABASE = value;
  }
});
process.env.DATABASE = DATABASE;

app.listen(port, () => {
  console.log(`server started at port ${port}`);
  console.log(`environment: ${ApplicationContext.env}`);
  console.log(`database: ${process.env.DATABASE}`);
  console.log(`config: ${ApplicationContext.configFilePath}`);
});
