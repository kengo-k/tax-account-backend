export {};
import * as fs from "fs";
import * as ejs from "ejs";
import { RootContext } from "@core/RootContext";
import { BaseService } from "@services/BaseService";

declare module "@services/BaseService" {
  interface BaseService {
    getTemplate<T>(templatePath: string): (params: T) => string;
  }
}

BaseService.prototype.getTemplate = <T>(templatePath: string) => {
  const template = fs.readFileSync(
    `${RootContext.templateRootDir}/${templatePath}`,
    "utf8"
  );
  return (params: T) => {
    return ejs.render(template, params);
  };
};
