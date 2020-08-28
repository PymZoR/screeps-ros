import { Listener } from "processes/listener";
import { Process } from "./process";
import { Ressource } from "processes/ressource";
import { Talker } from "processes/talker";
import { switchGuard } from "utils/switchGuard";

export function spawnProcess(type: ProcessType, options?: { pid?: number; args?: any[] }): Process {
  const pid = options?.pid ?? getNextPid();
  let processObject: Process<Record<string, any>>;

  switch (type) {
    case "Talker":
      processObject = new Talker(pid);
      break;

    case "Listener":
      processObject = new Listener(pid);
      break;

    case "Ressource":
      processObject = new Ressource(pid);
      break;

    default:
      throw switchGuard(type, "spawnProcess:type");
  }

  return processObject;
}

function getNextPid() {
  return Object.keys(Memory.processes).length;
}
