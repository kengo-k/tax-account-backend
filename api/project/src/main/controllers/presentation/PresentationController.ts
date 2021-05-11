import * as express from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "@core/container/types";
import { MasterService } from "@services/master/MasterService";
import { BaseController } from "@controllers/BaseController";
import { InitSearchResponse } from "@common/model/presentation/InitSearchResponse";
import { InitSearchRequest } from "@common/model/presentation/InitSearchRequest";
import { SummaryRequest } from "@common/model/presentation/SummaryRequest";
import { RequestError } from "@common/error/ApplicationError";
import { LedgerSearchResponse } from "@common/model/journal/LedgerSearchResponse";
import { JournalService } from "@services/journal/JournalService";
import { KamokuBunruiCodeConst } from "@common/constant/kamokuBunrui";
import { SummaryResponse } from "@common/model/presentation/SummaryResponse";

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
      const nendo_list = await this.masterService.selectNendoList();
      let targetNendo = nendo_list[0].nendo;
      if (param.nendo != null) {
        targetNendo = param.nendo;
      }
      let ledger_list: LedgerSearchResponse[] = [];
      if (param.ledger_cd != null) {
        ledger_list = await this.journalService.selectLedger({
          nendo: targetNendo,
          ledger_cd: param.ledger_cd,
        });
      }
      const kamoku_list = await this.masterService.selectKamokuList();
      const saimoku_list = await this.masterService.selectSaimokuList();
      const result: InitSearchResponse = {
        nendo_list,
        kamoku_list,
        saimoku_list,
        ledger_list,
      };
      return result;
    });
  }

  public selectSummary(req: express.Request<any>, res: express.Response<any>) {
    this.execute(req, res, async () => {
      // prettier-ignore
      const param = this.checkValidationResult(req.query,SummaryRequest.isValid(req.query));
      const request = new SummaryRequest(param);

      // 売上サマリ
      const sales = await this.journalService.summaryKamokuBunrui({
        nendo: request.nendo,
        kamoku_bunrui_cd: KamokuBunruiCodeConst.SALES,
      });
      // 経費サマリ
      const expenses = await this.journalService.summaryKamokuBunrui({
        nendo: request.nendo,
        kamoku_bunrui_cd: KamokuBunruiCodeConst.EXPENSES,
      });
      const result: SummaryResponse = {
        sales: sales.value,
        expenses: expenses.value,
      };
      return result;
    });
  }
}
