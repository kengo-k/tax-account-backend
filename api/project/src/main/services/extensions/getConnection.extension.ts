export {};
import { Client } from "pg";
import { BaseService } from "@services/BaseService";

declare module "@services/BaseService" {
  interface BaseService {
    getConnection(): Client;
  }
}

BaseService.prototype.getConnection = function () {
  return this.connectionProvider.getConnection();
};
