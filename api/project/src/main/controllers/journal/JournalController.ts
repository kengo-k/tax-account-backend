export class JournalController {
  public create(req: any, res: any) {
    console.log("CREATE!!");
    res.send(JSON.stringify({ result: 5 }));
  }
}
