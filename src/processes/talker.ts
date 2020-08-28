import * as pubsub from "../pubsub";
import { Process, ProcessMessage } from "os/process";
import { TalkerMsg } from "messages";

interface TalkerMemory {
  i: number;
}

export class Talker extends Process<TalkerMemory> {
  public getType(): ProcessType {
    return "Talker";
  }

  public onSIGINT(): void {
    console.log(`${this.pid} - Talker SIGINT`);
  }

  public *execute(): Generator<ProcessMessage, void, Record<string, unknown>> {
    this.memory.i = this.memory.i ?? 0;

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
  }
}
