import { Process } from "os/process";

export class Listener extends Process<Record<string, never>> {
  public getType(): ProcessType {
    return "Listener";
  }

  public *execute(): Generator<any, void, any> {
    this.subscribe("/test");
    // TODO: unsubscrive on process kill

    while (this.active) {
      const msg: { data: string } = yield { type: "wait" };
      console.log(`recv: ${JSON.stringify(msg.data)}`);
    }
  }

  public onSIGINT(): void {
    console.log(`${this.pid} - Listener SIGINT`);
  }
}
