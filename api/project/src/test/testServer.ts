import { app } from "../main/app";
import axios from "axios";
import { getContainer } from "@core/container/getContainer";
import { TYPES } from "@core/container/types";
import { ConnectionProvider } from "@core/connection/ConnectionProvider";

// TODO コンフィグ化する
const port = 8080;

const container = getContainer();
const connectionProvider = container.get<ConnectionProvider>(
  TYPES.ConnectionProvider
);
const connection = connectionProvider.getConnection();

class TestServer {
  private server: any;

  constructor() {
    this.server = undefined;
  }

  public getClient() {
    const client = axios.create({
      baseURL: "http://account_api:8080",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      responseType: "json",
      timeout: 15000,
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
    connection.close();
    this.server.close();
  }
}

export const testServer = new TestServer();
