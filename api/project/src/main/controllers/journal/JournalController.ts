import { inject, injectable } from "inversify";
import { TYPES } from "@core/container/types";
import { JournalEntity } from "@common/model/journal/JournalEntity";
import { JournalService } from "@services/journal/JournalService";
import { RequestError } from "@common/error/ApplicationError";
import { BaseController } from "@controllers/BaseController";

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
      return result;
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
      return result;
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
      return result;
    });
  }

  public delete(req: any, res: any) {
    this.execute(req, res, async () => {
      const id = this.checkId(req);
      const requestEntity = new JournalEntity({ id });
      const result = await this.journalService.delete(requestEntity);
      return result;
    });
  }
}
