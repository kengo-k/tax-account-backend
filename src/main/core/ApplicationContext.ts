import * as path from "path";

const currentDir = `${__dirname}`;

// プロジェクトのルート: /api/project
const projectRootDir = `${currentDir}/../../..`;

export enum Env {
  development = "development",
  production = "production",
  test = "test",
}

interface ApplicationContext {
  projectRootDir: string;
  templateRootDir: string;
  configFilePath: string;
  env: Env;
  setEnv: (newEnv: string) => void;
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
  projectRootDir: path.resolve(projectRootDir),
  templateRootDir: `${projectRootDir}/src/main/templates`,
  get env() {
    return env;
  },
  get configFilePath() {
    return `${projectRootDir}/src/main/core/database.yml`;
  },
  setEnv,
};

export { ApplicationContext };
