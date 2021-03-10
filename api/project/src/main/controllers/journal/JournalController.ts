import { inject, injectable } from "inversify";
import { TYPES } from "@core/container/types";
import { JournalEntity } from "@common/model/journal/JournalEntity";
import { JournalService } from "@services/journal/JournalService";
import { ApplicationError } from "@common/error/ApplicationError";
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
      const id = req.params["id"] - 0;
      const result = await this.journalService.selectById(JournalEntity, id);
      res.send(JSON.stringify(result));
    });
  }

  // TODO anyやめる
  public create(req: any, res: any) {
    const result = this.journalService.create(new JournalEntity(req.body));
    result
      .then((result) => {
        // TODO レスポンスの規格化
        res.send(JSON.stringify(result));
      })
      .catch(() => {
        // TODO エラー時のレスポンス
        res.send(JSON.stringify({ result: 5 }));
      });
  }

  public update(req: any, res: any) {
    let param = req.body;
    Object.assign(param, { id: req.params["id"] - 0 });
    const result = this.journalService.update(new JournalEntity(param));
    result
      .then((result) => {
        // TODO レスポンスの規格化
        res.send(JSON.stringify(result));
      })
      .catch(() => {
        // TODO エラー時のレスポンス
        res.send(JSON.stringify({ result: 5 }));
      });
  }

  public delete(req: any, res: any) {
    const id = req.params["id"] - 0;
    const result = this.journalService.delete(new JournalEntity({ id }));
    result
      .then((result) => {
        // TODO レスポンスの規格化
        res.send(JSON.stringify(result));
      })
      .catch(() => {
        // TODO エラー時のレスポンス
        res.send(JSON.stringify({ result: 5 }));
      });
  }
}
