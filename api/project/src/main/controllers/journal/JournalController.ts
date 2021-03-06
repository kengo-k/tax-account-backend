import { inject, injectable } from "inversify";
import { TYPES } from "@core/container/types";
import { JournalEntity } from "@model/journal/JournalEntity";
import { JournalService } from "@services/journal/JournalService";
import { TreatNull } from "@services/BaseService";

@injectable()
export class JournalController {
  public constructor(
    @inject(TYPES.JournalService)
    public journalService: JournalService
  ) {}

  // TODO anyやめる
  public create(req: any, res: any) {
    console.log(req.body);
    const result = this.journalService.create({
      entity: new JournalEntity(req.body),
      treatNull: TreatNull.DefaultIgnore,
      ignoreRows: [],
      nullRows: [],
    });
    result
      .then((result) => {
        // TODO レスポンスの規格化
        res.send(JSON.stringify(result));
      })
      .catch(() => {
        // TODO エラー時のレスポンス
        res.send(JSON.stringify({ result: 5 }));
      });
  }
}
