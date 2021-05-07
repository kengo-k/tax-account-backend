import * as express from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "@core/container/types";
import { MasterService } from "@services/master/MasterService";
import { BaseController } from "@controllers/BaseController";
import { InitSearchResponse } from "@common/model/presentation/InitSearchResponse";
import { InitSearchRequest } from "@common/model/presentation/InitSearchRequest";
import { RequestError } from "@common/error/ApplicationError";
import { LedgerSearchResponse } from "@common/model/journal/LedgerSearchResponse";
import { JournalService } from "@services/journal/JournalService";

@injectable()
export class PresentationController extends BaseController {
  public constructor(
    @inject(TYPES.MasterService)
    public masterService: MasterService,
    @inject(TYPES.JournalService)
    public journalService: JournalService
  ) {
    super();
  }

  public selectInit(req: express.Request<any>, res: express.Response<any>) {
    this.execute(req, res, async () => {
      const [param] = InitSearchRequest.isValid(req.query);
      if (param == null) {
        // prettier-ignore
        throw new RequestError(`invalid request: create for ${JSON.stringify(req.body)}`);
      }
      const nendoList = await this.masterService.selectNendoList();
      let targetNendo = nendoList[0].nendo;
      if (param.nendo != null) {
        targetNendo = param.nendo;
      }
      let ledgerList: LedgerSearchResponse[] = [];
      if (param.target_cd != null) {
        ledgerList = await this.journalService.selectLedger({
          nendo: targetNendo,
          target_cd: param.target_cd,
        });
      }
      const kamokuMasterList = await this.masterService.selectKamokuList();
      const saimokuMasterList = await this.masterService.selectSaimokuList();
      const result: InitSearchResponse = {
        nendoList,
        kamokuMasterList,
        saimokuMasterList,
        ledgerList,
      };
      return result;
    });
  }
}
