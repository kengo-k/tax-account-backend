import { injectable } from "inversify";
import { ApplicationError, RequestError } from "@common/error/ApplicationError";
import { SystemError } from "@common/error/SystemError";
import { ErrorResponse } from "@common/model/Response";

@injectable()
export class BaseController {
  public async execute(req: any, res: any, run: () => void) {
    try {
      const result = await run();
      res.send(JSON.stringify(result));
    } catch (e) {
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

  public setErrorResponse(res: any, error: ApplicationError | SystemError) {
    const response: ErrorResponse = {
      success: false,
      error,
    };
    res.status(error.HTTP_CODE);
    res.send(JSON.stringify(response));
  }

  public checkId(req: any) {
    const id = req.params["id"] - 0;
    if (isNaN(id)) {
      throw new RequestError(`invalid id format: ${req.params["id"]}`);
    }
    return id;
  }
}
