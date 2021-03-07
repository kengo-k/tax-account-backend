import { inject, injectable } from "inversify";
import { TYPES } from "@core/container/types";
import { JournalEntity } from "@model/journal/JournalEntity";
import { JournalService } from "@services/journal/JournalService";
import { TreatNull } from "@services/misc";

@injectable()
export class JournalController {
  public constructor(
    @inject(TYPES.JournalService)
    public journalService: JournalService
  ) {}

  public selectById(req: any, res: any) {
    const id = req.params["id"];
    const result = this.journalService.selectById(JournalEntity, id);
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

  // TODO anyやめる
  public create(req: any, res: any) {
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
