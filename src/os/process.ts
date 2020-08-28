import * as pubsub from "pubsub";

export abstract class Process {
  pid: number;
  type: ProcessType;
  memory: any;
  active: boolean;
  tick: Generator<any, boolean, any>;

  constructor(pid: number) {
    this.pid = pid;
    this.type = this.getType();
    this.active = true;

    // Restore or init memory
    if (!Memory.processes[this.pid]) {
      registerProcess(this);
      this.memory = Memory.processes[this.pid].memory;
      this.setup();
      console.log("setup");
    }

    this.memory = Memory.processes[this.pid].memory;
    this.tick = this.execute();
  }

  abstract getType(): ProcessType;

  setup() {}

  abstract execute(): Generator<string | undefined, boolean, any>;

  onSIGINT(): void {}

  processSignals(): void {
    const signalsTopic = Memory.pubsub[`/${this.pid}`];

    for (const message of signalsTopic.messages) {
      if (message.data?.type === "signal") {
        switch (message.data.signal) {
          case "SIGINT":
            this.active = false;
            this.onSIGINT();
            break;
        }
      }
    }

    signalsTopic.messages = [];
  }

  serialize(): SerializedProcess {
    return {
      pid: this.pid,
      type: this.type,
      memory: this.memory
    };
  }

  subscribe(topicName: string) {
    pubsub.subscribe(this.pid, topicName);
  }
}

function registerProcess(processObject: Process) {
  Memory.processes[processObject.pid] = { repr: processObject.serialize(), memory: {}, sleepingUntil: 0 };
  processObject.subscribe(`/${processObject.pid}`);
}

export function unserializeProcess(serializedProcess: SerializedProcess, spawnProcess: Function): [number, Process] {
  const processObject = spawnProcess(serializedProcess.type, { pid: serializedProcess.pid });

  return [serializedProcess.pid, processObject];
}
