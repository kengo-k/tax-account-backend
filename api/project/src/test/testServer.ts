import { app } from "../main/app";
import axios from "axios";

// TODO コンフィグ化する
const port = 8080;

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
    this.server.close();
  }
}

export const testServer = new TestServer();
