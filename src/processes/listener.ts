import { Process } from "os/process";
import { TalkerMsg } from "messages";

export class Listener extends Process {
  getType(): ProcessType {
    return "Listener";
  }

  *execute(): Generator<any, boolean, any> {
    this.subscribe("/test");
    // TODO: unsubscrive on process kill

    while (this.active) {
      const msg: any = yield { type: "wait" };
      console.log(`recv: ${JSON.stringify(msg.data)}`);
    }

    return this.active;
  }

  onSIGINT() {
    console.log(`${this.pid} - Listener SIGINT`);
  }
}
