type ProcessType = "Talker" | "Listener" | "Ressource";

interface SerializedProcess {
  pid: number;
  type: ProcessType;
  memory: Record<string, any>;
}

interface Memory {
  init: boolean;
  processes: Record<number, { repr: SerializedProcess; sleepingUntil: number; memory: Record<string, unknown> }>;
  pubsub: Record<
    string,
    {
      listeners: number[];
      messages: {
        source: number;
        data: Record<string, unknown>;
      }[];
    }
  >;
}
