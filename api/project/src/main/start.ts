import { ApplicationContext, Env } from "@core/ApplicationContext";
import { app } from "./app";

if (process.env.NODE_ENV === Env.production) {
  ApplicationContext.setEnv(Env.production);
} else if (process.env.NODE_ENV === Env.development) {
  ApplicationContext.setEnv(Env.development);
} else {
  ApplicationContext.setEnv(Env.development);
}

app.listen(8080, () => {
  console.log(` ${ApplicationContext.env} server started`);
});
