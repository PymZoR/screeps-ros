type ProcessType = "Talker" | "Listener";

interface SerializedProcess {
  pid: number;
  type: ProcessType;
  memory: object;
}

interface Memory {
  init: boolean;
  processes: Record<number, { repr: SerializedProcess; sleepingUntil: number; memory: object }>;
  pubsub: Record<
    string,
    {
      listeners: number[];
      messages: Array<{
        source: number;
        data: any;
      }>;
    }
  >;
}
