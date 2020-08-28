import * as pubsub from "pubsub";

interface ProcessYieldMessage {
  type: "wait";
}

interface ProcessSleepMessage {
  type: "sleep";
  data: number;
}

interface ProcessPublishMessage {
  type: "publish";
}

export type ProcessMessage =
  | ProcessYieldMessage
  | ProcessSleepMessage
  | ProcessPublishMessage;

export abstract class Process<
  TMemory = Record<string, unknown>,
  TInputMessageData = Record<string, unknown>
> {
  public pid: number;
  public type: ProcessType;
  public memory: TMemory;
  public active: boolean;
  public tick: Generator<ProcessMessage, void, TInputMessageData>;

  public constructor(pid: number) {
    this.pid = pid;
    this.type = this.getType();
    this.active = true;

    // Restore or init memory
    if (!Memory.processes[this.pid]) {
      registerProcess(this);
      this.memory = {} as TMemory;
      this.setup();
      console.log("setup");
    }

    this.memory = Memory.processes[this.pid].memory as TMemory;
    this.tick = this.execute();
  }

  abstract getType(): ProcessType;

  public setup(): void {
    return;
  }

  abstract execute(): Generator<ProcessMessage, void, TInputMessageData>;

  public onSIGINT(): void {
    return;
  }

  public processSignals(): void {
    const signalsTopic = Memory.pubsub[`/${this.pid}`];

    for (const message of signalsTopic.messages) {
      const data = message.data as
        | {
            type: "signal";
            signal: "SIGINT";
          }
        | undefined;

      if (data?.type === "signal") {
        switch (data.signal) {
          case "SIGINT":
            this.active = false;
            this.onSIGINT();
            break;
        }
      }
    }

    signalsTopic.messages = [];
  }

  public serialize(): SerializedProcess {
    return {
      pid: this.pid,
      type: this.type,
      memory: this.memory
    };
  }

  public subscribe(topicName: string): void {
    pubsub.subscribe(this.pid, topicName);
  }
}

function registerProcess(
  processObject: Process<Record<string, any>, Record<string, any>>
): void {
  Memory.processes[processObject.pid] = {
    repr: processObject.serialize(),
    memory: {},
    sleepingUntil: 0
  };
  processObject.subscribe(`/${processObject.pid}`);
}

export function unserializeProcess(
  serializedProcess: SerializedProcess,
  spawnProcess: (type: ProcessType, params: { pid: number }) => Process
): [number, Process] {
  const processObject = spawnProcess(serializedProcess.type, {
    pid: serializedProcess.pid
  });

  return [serializedProcess.pid, processObject];
}
