import { inject, injectable } from "inversify";
import { TYPES } from "@core/container/types";
import { SaimokuService } from "@services/master/SaimokuService";
import { BaseController } from "@controllers/BaseController";
import { SaimokuSearchRequest } from "@common/model/master/SaimokuSearchRequest";
import { NotFoundError, RequestError } from "@common/error/ApplicationError";

@injectable()
export class MasterController extends BaseController {
  public constructor(
    @inject(TYPES.SaimokuService)
    public saimokuService: SaimokuService
  ) {
    super();
  }

  public selectSaimoku(req: any, res: any) {
    this.execute(req, res, async () => {
      const [param] = SaimokuSearchRequest.isValid(req.params);
      if (param == null) {
        // prettier-ignore
        throw new RequestError(`invalid request`);
      }
      const cond = new SaimokuSearchRequest(param);
      const result = await this.saimokuService.selectSaimokuDetail(cond);
      if (result == null) {
        // prettier-ignore
        throw new NotFoundError(`invalid result`);
      }
      return result;
    });
  }
}
