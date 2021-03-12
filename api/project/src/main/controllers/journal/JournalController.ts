import { inject, injectable } from "inversify";
import { TYPES } from "@core/container/types";
import { JournalEntity } from "@common/model/journal/JournalEntity";
import { JournalService } from "@services/journal/JournalService";
import { ApplicationError, RequestError } from "@common/error/ApplicationError";
import { SystemError } from "@common/error/SystemError";
import { ErrorResponse } from "@common/model/Response";

@injectable()
export class BaseController {
  public async execute(req: any, res: any, run: () => void) {
    try {
      await run();
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

@injectable()
export class JournalController extends BaseController {
  public constructor(
    @inject(TYPES.JournalService)
    public journalService: JournalService
  ) {
    super();
  }

  public selectById(req: any, res: any) {
    this.execute(req, res, async () => {
      const id = this.checkId(req);
      const result = await this.journalService.selectById(JournalEntity, id);
      res.send(JSON.stringify(result));
    });
  }

  // TODO anyやめる
  public create(req: any, res: any) {
    this.execute(req, res, async () => {
      const [param] = JournalEntity.isCreatable(req.body);
      if (param == null) {
        throw new RequestError(`invalid request: ${JSON.stringify(req.body)}`);
      }
      const requestEntity = new JournalEntity(param);
      const result = await this.journalService.create(requestEntity);
      res.send(JSON.stringify(result));
    });
  }

  public update(req: any, res: any) {
    this.execute(req, res, async () => {
      const id = this.checkId(req);
      const [param] = JournalEntity.isUpdatable(req.body);
      if (param == null) {
        throw new RequestError(`invalid request: ${JSON.stringify(req.body)}`);
      }
      Object.assign(param, { id });
      const requestEntity = new JournalEntity(param);
      const result = await this.journalService.update(requestEntity);
      res.send(JSON.stringify(result));
    });
  }

  public delete(req: any, res: any) {
    this.execute(req, res, async () => {
      const id = this.checkId(req);
      const requestEntity = new JournalEntity({ id });
      const result = await this.journalService.delete(requestEntity);
      res.send(JSON.stringify(result));
    });
  }
}
