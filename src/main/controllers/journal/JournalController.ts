import { BaseController } from "@controllers/BaseController";
import { TYPES } from "@core/container/types";
import { NotFoundError } from "@kengo-k/account-common/error/ApplicationError";
import { JournalEntity } from "@kengo-k/account-common/model/journal/JournalEntity";
import { JournalSearchRequest } from "@kengo-k/account-common/model/journal/JournalSearchRequest";
import { LedgerCreateRequest } from "@kengo-k/account-common/model/journal/LedgerCreateRequest";
import { LedgerSearchRequest } from "@kengo-k/account-common/model/journal/LedgerSearchRequest";
import { LedgerUpdateRequest } from "@kengo-k/account-common/model/journal/LedgerUpdateRequest";
import { JournalService } from "@services/journal/JournalService";
import * as express from "express";
import { inject, injectable } from "inversify";

@injectable()
export class JournalController extends BaseController {
  public constructor(
    @inject(TYPES.JournalService)
    public journalService: JournalService
  ) {
    super();
  }

  // prettier-ignore
  public selectById(req: express.Request<any>, res: express.Response<any>) {
    this.execute(req, res, async () => {
      const id = this.checkId(req);
      const result = await this.journalService.selectById(JournalEntity, id);
      if (result == null) {
        throw new NotFoundError(`invalid result: select for JournalEntity(${id}) was not found`);
      }
      return result;
    });
  }

  // TODO anyやめる
  public create(req: express.Request<any>, res: express.Response<any>) {
    this.execute(req, res, async () => {
      const json = this.getRequestJson(req);
      const validJson = this.validateJson(json, JournalEntity.isCreatable);
      const condition = new JournalEntity(validJson);
      const result = await this.journalService.create(condition);
      if (result == null) {
        // prettier-ignore
        throw new NotFoundError(`invalid result: create for JournalEntity`);
      }
      return result;
    });
  }

  public update(req: express.Request<any>, res: express.Response<any>) {
    this.execute(req, res, async () => {
      const id = this.checkId(req);
      const json = this.getRequestJson(req, "id");
      const validJson = this.validateJson(json, JournalEntity.isUpdatable);
      Object.assign(validJson, { id });
      const condition = new JournalEntity(validJson);
      const result = await this.journalService.update(condition);
      if (result == null) {
        // prettier-ignore
        throw new NotFoundError(`invalid result: update for JournalEntity(${id}) was not found`);
      }
      return result;
    });
  }

  public delete(req: express.Request<any>, res: express.Response<any>) {
    this.execute(req, res, async () => {
      const id = this.checkId(req);
      const condition = new JournalEntity({ id });
      const result = await this.journalService.delete(condition);
      if (result == null) {
        // prettier-ignore
        throw new NotFoundError(`invalid result: delete for JournalEntity(${id}) was not found`);
      }
      return result;
    });
  }

  public selectJournals(req: express.Request<any>, res: express.Response<any>) {
    this.execute(req, res, async () => {
      const json = this.getRequestJson(req);
      const validJson = this.validateJson(json, JournalSearchRequest.isValid);
      const condition = new JournalSearchRequest(validJson);
      const result = await this.journalService.selectJournals(condition);
      return result;
    });
  }

  public selectLedger(req: express.Request<any>, res: express.Response<any>) {
    this.execute(req, res, async () => {
      const json = this.getRequestJson(req);
      const validJson = this.validateJson(json, LedgerSearchRequest.isValid);
      const condition = new LedgerSearchRequest(validJson);
      const result = await this.journalService.selectLedger(condition);
      return result;
    });
  }

  public createLedger(req: express.Request<any>, res: express.Response<any>) {
    this.execute(req, res, async () => {
      const json = this.getRequestJson(req);
      const validJson = this.validateJson(json, LedgerCreateRequest.isValid);
      const condition = new LedgerCreateRequest(validJson);
      const result = await this.journalService.createLedger(condition);
      return result;
    });
  }

  public updateLedger(req: express.Request<any>, res: express.Response<any>) {
    this.execute(req, res, async () => {
      const id = this.checkId(req);
      const json = this.getRequestJson(req, "id");
      Object.assign(json, { id });
      const validJson = this.validateJson(json, LedgerUpdateRequest.isValid);
      const condition = new LedgerUpdateRequest(validJson);
      const result = await this.journalService.updateLedger(condition);
      return result;
    });
  }
}
