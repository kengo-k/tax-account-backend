import { inject, injectable } from "inversify";
import { TYPES } from "@core/container/types";
import { JournalEntity } from "@common/model/journal/JournalEntity";
import { JournalService } from "@services/journal/JournalService";
import { NotFoundError, RequestError } from "@common/error/ApplicationError";
import { BaseController } from "@controllers/BaseController";
import { LedgerSearchRequest } from "@common/model/journal/LedgerSearchRequest";

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
      if (result == null) {
        // prettier-ignore
        throw new NotFoundError(`invalid result: select for JournalEntity(${id}) was not found`);
      }
      return result;
    });
  }

  // TODO anyやめる
  public create(req: any, res: any) {
    this.execute(req, res, async () => {
      const [param] = JournalEntity.isCreatable(req.body);
      if (param == null) {
        // prettier-ignore
        throw new RequestError(`invalid request: create for ${JSON.stringify(req.body)}`);
      }
      const requestEntity = new JournalEntity(param);
      const result = await this.journalService.create(requestEntity);
      if (result == null) {
        // prettier-ignore
        throw new NotFoundError(`invalid result: create for JournalEntity`);
      }
      return result;
    });
  }

  public update(req: any, res: any) {
    this.execute(req, res, async () => {
      const id = this.checkId(req);
      const [param] = JournalEntity.isUpdatable(req.body);
      if (param == null) {
        // prettier-ignore
        throw new RequestError(`invalid request: update for ${JSON.stringify(req.body)}`);
      }
      Object.assign(param, { id });
      const requestEntity = new JournalEntity(param);
      const result = await this.journalService.update(requestEntity);
      if (result == null) {
        // prettier-ignore
        throw new NotFoundError(`invalid result: update for JournalEntity(${id}) was not found`);
      }
      return result;
    });
  }

  public delete(req: any, res: any) {
    this.execute(req, res, async () => {
      const id = this.checkId(req);
      const requestEntity = new JournalEntity({ id });
      const result = await this.journalService.delete(requestEntity);
      if (result == null) {
        // prettier-ignore
        throw new NotFoundError(`invalid result: delete for JournalEntity(${id}) was not found`);
      }
      return result;
    });
  }

  public selectLedger(req: any, res: any) {
    this.execute(req, res, async () => {
      const [param] = LedgerSearchRequest.isValid(req.params);
      if (param == null) {
        // prettier-ignore
        throw new RequestError(
          `invalid request: ${JSON.stringify(req.params)}`
        );
      }
      const request = new LedgerSearchRequest(param);
      const result = await this.journalService.selectLedger(request);
      return result;
    });
  }
}
