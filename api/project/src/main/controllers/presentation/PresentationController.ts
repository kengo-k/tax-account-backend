import { inject, injectable } from "inversify";
import { TYPES } from "@core/container/types";
import { MasterService } from "@services/master/MasterService";
import { BaseController } from "@controllers/BaseController";
import { InitSearchResponse } from "@common/model/presentation/InitSearchResponse";

@injectable()
export class PresentationController extends BaseController {
  public constructor(
    @inject(TYPES.MasterService)
    public masterService: MasterService
  ) {
    super();
  }

  public selectInit(req: any, res: any) {
    this.execute(req, res, async () => {
      const nendoList = await this.masterService.selectNendoList();
      const kamokuMasterList = await this.masterService.selectKamokuList();
      const saimokuMasterList = await this.masterService.selectSaimokuList();
      const result: InitSearchResponse = {
        nendoList,
        kamokuMasterList,
        saimokuMasterList,
        ledgerList: [],
      };
      return result;
    });
  }
}
