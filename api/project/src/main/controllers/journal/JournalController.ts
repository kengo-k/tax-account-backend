import { inject, injectable } from "inversify";
import { TYPES } from "@core/container/types";
import { JournalEntity } from "@model/journal/JournalEntity";
import { JournalService } from "@services/journal/JournalService";
import { NullOption, TreatNull } from "@services/misc";

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
    const result = this.journalService.create(new JournalEntity(req.body));
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

  public update(req: any, res: any) {
    let param = req.body;
    Object.assign(param, { id: req.params["id"] - 0 });
    const result = this.journalService.update(new JournalEntity(param));
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

  public delete(req: any, res: any) {
    const id = req.params["id"] - 0;
    const result = this.journalService.delete(new JournalEntity({ id }));
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
