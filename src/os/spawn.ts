import { Process } from "./process";
import { Talker } from "processes/talker";
import { Listener } from "processes/listener";
import { switchGuard } from "utils/switchGuard";

export function spawnProcess(type: ProcessType, options?: { pid?: number; args?: Array<any> }): Process {
  const pid = options?.pid ?? getNextPid();
  let processObject: Process;

  switch (type) {
    case "Talker":
      processObject = new Talker(pid);
      break;

    case "Listener":
      processObject = new Listener(pid);
      break;

    default:
      throw switchGuard(type, "spawnProcess:type");
  }

  return processObject;
}

function getNextPid() {
  return Object.keys(Memory.processes).length;
}
