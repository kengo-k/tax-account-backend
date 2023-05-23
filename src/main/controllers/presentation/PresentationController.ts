import * as express from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "@core/container/types";
import { MasterService } from "@services/master/MasterService";
import { BaseController } from "@controllers/BaseController";
import { InitSearchResponse } from "@common/model/presentation/InitSearchResponse";
import { InitSearchRequest } from "@common/model/presentation/InitSearchRequest";
import { SummaryRequest } from "@common/model/presentation/SummaryRequest";
import { LedgerSearchResponse } from "@common/model/journal/LedgerSearchResponse";
import { JournalService } from "@services/journal/JournalService";
import { KamokuBunruiCodeConst } from "@common/constant/kamokuBunrui";
import { SummaryResponse } from "@common/model/presentation/SummaryResponse";
import { LedgerSearchRequest } from "@common/model/journal/LedgerSearchRequest";
import { KamokuBunruiSummaryRequest } from "@common/model/journal/KamokuBunruiSummaryRequest";
import { TaxCalcRequest } from "@common/model/journal/TaxCalcRequest";

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