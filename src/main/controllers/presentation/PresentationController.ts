import { BaseController } from "@controllers/BaseController";
import { TYPES } from "@core/container/types";
import { KamokuBunruiCodeConst } from "@kengo-k/account-common/constant/kamokuBunrui";
import { KamokuBunruiSummaryRequest } from "@kengo-k/account-common/model/journal/KamokuBunruiSummaryRequest";
import { TaxCalcRequest } from "@kengo-k/account-common/model/journal/TaxCalcRequest";
import { InitSearchResponse } from "@kengo-k/account-common/model/presentation/InitSearchResponse";
import { SummaryRequest } from "@kengo-k/account-common/model/presentation/SummaryRequest";
import { SummaryResponse } from "@kengo-k/account-common/model/presentation/SummaryResponse";
import { JournalService } from "@services/journal/JournalService";
import { MasterService } from "@services/master/MasterService";
import * as express from "express";
import { inject, injectable } from "inversify";

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
      const nendo_list = await this.masterService.selectNendoList();
      const kamoku_list = await this.masterService.selectKamokuList();
      const saimoku_list = await this.masterService.selectSaimokuList();
      // TODO なんとかする
      const result: InitSearchResponse = {
        nendo_list: (nendo_list as any).list,
        kamoku_list: (kamoku_list as any).list,
        saimoku_list: (saimoku_list as any).list,
        ledger_list: [],
      };
      return result;
    });
  }

  public selectSummary(req: express.Request<any>, res: express.Response<any>) {
    this.execute(req, res, async () => {
      const json = this.getRequestJson(req);
      const validJson = this.validateJson(json, SummaryRequest.isValid);
      const condition = new SummaryRequest(validJson);

      // 売上サマリ
      const sales = await this.journalService.summaryKamokuBunrui(
        new KamokuBunruiSummaryRequest({
          nendo: condition.nendo,
          kamoku_bunrui_cd: KamokuBunruiCodeConst.SALES,
        })
      );
      // 経費サマリ
      const expenses = await this.journalService.summaryKamokuBunrui(
        new KamokuBunruiSummaryRequest({
          nendo: condition.nendo,
          kamoku_bunrui_cd: KamokuBunruiCodeConst.EXPENSES,
        })
      );
      // 税額計算
      const tax = await this.journalService.calcTax(
        new TaxCalcRequest({ nendo: condition.nendo })
      );

      const result: SummaryResponse = new SummaryResponse({
        sales: sales.value,
        expenses: expenses.value,
        tax,
      });

      return result;
    });
  }
}
