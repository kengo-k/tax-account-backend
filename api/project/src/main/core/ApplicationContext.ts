import * as path from "path";

const currentDir = `${__dirname}`;

// 実装ソースのディレクトリルート: /api/project/src/main
const srcRootDir = `${currentDir}/..`;
// プロジェクトのルート: /api/project
const projectRootDir = `${srcRootDir}/../..`;
// APIディレクトリのルート: /api
const apiRootDir = `${projectRootDir}/..`;

const ApplicationContext = {
  srcRootDir: path.resolve(srcRootDir),
  projectRootDir: path.resolve(projectRootDir),
  apiRootDir: path.resolve(apiRootDir),
  templateRootDir: `${srcRootDir}/templates`,
};

export { ApplicationContext };
