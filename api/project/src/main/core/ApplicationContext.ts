import * as path from "path";

const currentDir = `${__dirname}`;

// 実装ソースのディレクトリルート: /api/project/src/main
const srcRootDir = `${currentDir}/..`;
// プロジェクトのルート: /api/project
const projectRootDir = `${srcRootDir}/../..`;
// APIディレクトリのルート: /api
const apiRootDir = `${projectRootDir}/..`;

export enum Env {
  development = "development",
  production = "production",
  test = "test",
}

interface ApplicationContext {
  srcRootDir: string;
  projectRootDir: string;
  apiRootDir: string;
  templateRootDir: string;
  env: Env;
  setEnv: (newEnv: string) => void;
  configFilePath: string;
}

let env = Env.development;
const setEnv = (newEnv: string) => {
  switch (newEnv) {
    case Env.development:
      env = Env.development;
      break;
    case Env.production:
      env = Env.production;
      break;
    case Env.test:
      env = Env.test;
      break;
    default:
      // TODO
      throw new Error();
  }
};

const ApplicationContext: ApplicationContext = {
  srcRootDir: path.resolve(srcRootDir),
  projectRootDir: path.resolve(projectRootDir),
  apiRootDir: path.resolve(apiRootDir),
  templateRootDir: `${srcRootDir}/templates`,
  get env() {
    return env;
  },
  get configFilePath() {
    const env = this.env;
    if (env === Env.development) {
      return `${apiRootDir}/config/database.yml`;
    } else {
      return "/tmp/database.yml";
    }
  },
  setEnv,
};

console.log("apiRootDir:", apiRootDir);
console.log("applicationContext:", ApplicationContext);
console.log("path:", path.resolve(""));
export { ApplicationContext };
