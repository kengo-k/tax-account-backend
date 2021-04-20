import { inject, injectable } from "inversify";
import { TYPES } from "@core/container/types";
import { MasterService } from "@services/master/MasterService";
import { BaseController } from "@controllers/BaseController";

@injectable()
export class MasterController extends BaseController {
  public constructor(
    @inject(TYPES.MasterService)
    public masterService: MasterService
  ) {
    super();
  }
}
