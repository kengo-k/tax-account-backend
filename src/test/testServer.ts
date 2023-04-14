import { app, port } from "../main/app";
import axios from "axios";
import { getContainer } from "@core/container/getContainer";
import { TYPES } from "@core/container/types";
import { ConnectionProvider } from "@core/connection/ConnectionProvider";
import { ConnectionWrapper } from "@core/connection/ConnectionWrapper";

// prettier-ignore
const getConnection = () => {
  const container = getContainer();
  const connectionProvider = container.get<ConnectionProvider>(TYPES.ConnectionProvider);
  const connection = connectionProvider.getConnection();
  return connection;
}

class TestServer {
  private server: any;
  private connection: ConnectionWrapper | undefined;

  constructor() {
    this.server = undefined;
    this.connection = undefined;
  }

  public getConnection() {
    if (this.connection == null) {
      this.connection = getConnection();
    }
    return this.connection as ConnectionWrapper;
  }

  public getClient() {
    const client = axios.create({
      baseURL: `http://backend:${port}`,
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      responseType: "json",
      timeout: 15000,
      validateStatus: () => true,
    });
    return client;
  }

  public start() {
    const promise = new Promise((resolve) => {
      this.server = app.listen(port, async () => {
        resolve(1);
      });
    });
    return promise;
  }

  public stop() {
    this.server.close();
  }
}

export const testServer = new TestServer();
