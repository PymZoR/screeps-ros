import { Process } from "os/process";
import { TalkerMsg } from "messages";
import * as pubsub from "../pubsub";

export class Talker extends Process {
  getType(): ProcessType {
    return "Talker";
  }

  onSIGINT() {
    console.log(`${this.pid} - Talker SIGINT`);
  }

  setup() {
    this.memory.i = 0;
  }

  *execute(): Generator<any, boolean, any> {
    const publisher = pubsub.Publisher<TalkerMsg>(this.pid, "/test");

    while (this.active) {
      this.memory.i = this.memory.i + 1;
      const msg: TalkerMsg = { msg: `i: ${this.memory.i}` };
      console.log(`send: ${JSON.stringify(msg)}`);
      yield publisher.publish(msg);
      yield {
        type: "sleep",
        data: Date.now() + 3000
      };
    }

    return this.active;
  }
}
