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
      .then((x) => {
        console.log(x);
        res.send(JSON.stringify({ result: 5 }));
      })
      .catch((x) => {
        console.log("catch!!");
        res.send(JSON.stringify({ result: 5 }));
      });
  }
}
