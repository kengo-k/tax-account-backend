import "tsconfig-paths/register";
//import * as child_process from "child_process";
import { ApplicationContext, Env } from "@core/ApplicationContext";
import { testServer } from "@test/testServer";

import * as fs from "fs";
import * as path from 'path';
const { execSync } = require('child_process')

export default async function () {

  require('dotenv').config({ path: '.env.test' });
  execSync('npx prisma migrate reset --force')
  execSync('npx prisma migrate dev')

  // テスト環境に切り替える
  ApplicationContext.setEnv(Env.test);
  // コネクションを生成しておく
  testServer.getConnection();
  // TODO ユーザ名とパスワードは直書きをやめること(database.yml経由で取得する)
  const files = fs.readdirSync(ApplicationContext.dataDir);
  files.forEach(fileName => {
    const tableName = path.basename(fileName, ".csv");
    const filePath = `${ApplicationContext.dataDir}/${fileName}`;
    execSync(`psql -U root -d test -h account_db -c "\\copy ${tableName} FROM '${filePath}' DELIMITER ',' CSV HEADER"`);
  });

  // express起動
  await testServer.start();
}
