import { ApplicationContext } from "@core/ApplicationContext";
import { ConnectionProvider } from "@core/connection/ConnectionProvider";
import * as fs from "fs";
import * as path from 'path';

const { execSync } = require('child_process')

const main = () => {
  // check NODE_ENV variable
  if (process.env.NODE_ENV == null) {
    console.error("環境変数NODE_ENVが指定されていません");
    process.exit(1);
  }

  ApplicationContext.setEnv(process.env.NODE_ENV);
  const provider = new ConnectionProvider();
  const connection = provider.getConnection();

  const files = fs.readdirSync(ApplicationContext.dataDir);
  files.forEach(fileName => {
    const tableName = path.basename(fileName, ".csv");
    const filePath = `${ApplicationContext.dataDir}/${fileName}`;
    execSync(`
      psql \
        -U ${connection.username} \
        -d ${connection.database} \
        -h ${connection.host} \
        -c "\\copy ${tableName} FROM '${filePath}' DELIMITER ',' CSV HEADER"`);
  });
};

main();
