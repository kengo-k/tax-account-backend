import * as express from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "@core/container/types";
import { JournalEntity } from "@common/model/journal/JournalEntity";
import { JournalService } from "@services/journal/JournalService";
import { NotFoundError, RequestError } from "@common/error/ApplicationError";
import { BaseController } from "@controllers/BaseController";
import { LedgerSearchRequest } from "@common/model/journal/LedgerSearchRequest";
import { LedgerCreateRequest } from "@common/model/journal/LedgerCreateRequest";
import { LedgerUpdateRequest } from "@common/model/journal/LedgerUpdateRequest";
import { JournalSearchRequest } from "@common/model/journal/JournalSearchRequest";

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

  public update(req: express.Request<any>, res: express.Response<any>) {
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

  public delete(req: express.Request<any>, res: express.Response<any>) {
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

  public selectJournals(req: express.Request<any>, res: express.Response<any>) {
    this.execute(req, res, async () => {
      const [param] = JournalSearchRequest.isValid(req.params);
      if (param == null) {
        // prettier-ignore
        throw new RequestError(
          `invalid request: ${JSON.stringify(req.params)}`
        );
      }
      const request = new JournalSearchRequest(param);
      const result = await this.journalService.selectJournals(request);
      return result;
    });
  }

  public selectLedger(req: express.Request<any>, res: express.Response<any>) {
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

  public createLedger(req: express.Request<any>, res: express.Response<any>) {
    this.execute(req, res, async () => {
      const params = {};
      Object.assign(params, req.body);
      const [param, error] = LedgerCreateRequest.isValid(params);
      if (param == null) {
        // prettier-ignore
        throw new RequestError(
          `invalid request: ${JSON.stringify(params)}`
        );
      }
      const request = new LedgerCreateRequest(param);
      const result = await this.journalService.createLedger(request);
      return result;
    });
  }

  public updateLedger(req: express.Request<any>, res: express.Response<any>) {
    this.execute(req, res, async () => {
      const params = {};
      const id = this.checkId(req);
      Object.assign(params, { id });
      Object.assign(params, req.body);
      const [param, error] = LedgerUpdateRequest.isValid(params);
      if (param == null) {
        // prettier-ignore
        throw new RequestError(`invalid request: ${JSON.stringify(params)}`);
      }
      const request = new LedgerUpdateRequest(param);
      const result = await this.journalService.updateLedger(request);
      return result;
    });
  }
}
