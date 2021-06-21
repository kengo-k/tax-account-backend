import * as express from "express";
import { injectable } from "inversify";
import { ApplicationError, RequestError } from "@common/error/ApplicationError";
import { SystemError } from "@common/error/SystemError";
import { ErrorResponse, SuccessResponse } from "@common/model/Response";
import { Converter } from "@common/Converter";

@injectable()
export class BaseController {
  public async execute(
    req: express.Request<any>,
    res: express.Response<any>,
    run: () => void
  ) {
    try {
      const result = await run();
      const successResponse: SuccessResponse = {
        success: true,
        body: result,
      };
      res.send(JSON.stringify(successResponse));
    } catch (e) {
      console.log(e);
      if (e instanceof SystemError) {
        this.setErrorResponse(res, e);
      } else if (e instanceof ApplicationError) {
        this.setErrorResponse(res, e);
      } else {
        res.status(500);
        res.send("uncaught system error");
      }
    }
  }

  public setErrorResponse(
    res: express.Response<any>,
    error: ApplicationError | SystemError
  ) {
    const response: ErrorResponse = {
      success: false,
      error,
    };
    res.status(error.HTTP_CODE);
    res.send(JSON.stringify(response));
  }

  public checkId(req: express.Request<{ id: number }>) {
    const id = req.params["id"] - 0;
    if (isNaN(id)) {
      throw new RequestError(`invalid id format: ${req.params["id"]}`);
    }
    return id;
  }

  public validateJson<T>(params: any, validate: Converter<T>["convert"]): T {
    const result = validate(params);
    if (result[0] == null) {
      throw new RequestError(
        // prettier-ignore
        `invalid request(${JSON.stringify(params)}), reason: ${JSON.stringify(result[1])}`
      );
    }
    return result[0];
  }

  public getRequestJson(req: express.Request<any>, ...excludes: string[]) {
    const json = {};
    Object.assign(json, req.params);
    Object.assign(json, req.query);
    Object.assign(json, req.body);
    for (const key of excludes) {
      delete (json as any)[key];
    }
    return json;
  }
}
