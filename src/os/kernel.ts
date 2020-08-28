import { Process, unserializeProcess } from "./process";
import { buildTickLimit } from "os/tickLimit";
import { spawnProcess } from "os/spawn";

const tickLimit = buildTickLimit();

function initMemory() {
  if (!Memory.init) {
    Memory.init = true;
    Memory.processes = {};
    Memory.pubsub = {};
  }
}

function resetMemory() {
  Memory.init = false;
}

// TODO: cleanup pubsub of killed process
export function killProcess(source: number, pid: number) {
  delete Memory.processes[pid];

  let nextPubsub: typeof Memory.pubsub = {};

  for (const [topicName, topic] of Object.entries(Memory.pubsub)) {
    const nextTopic = {
      listeners: topic.listeners.filter(listenerPid => listenerPid !== pid),
      messages: topic.messages
    };

    if (nextTopic.listeners.length === 0) {
      continue;
    }

    nextPubsub[topicName] = nextTopic;
  }

  Memory.pubsub = nextPubsub;
}

export function displayProcessTable() {
  console.log("PID     Type");
  console.log("------------");

  for (const process of Object.values(Memory.processes)) {
    console.log(`${process.repr.pid}     ${process.repr.type}`);
  }

  console.log("\n");
}

export function init() {
  initMemory();
}

export function loop() {
  const processes = new Map<number, Process>(
    Object.values(Memory.processes).map(process => unserializeProcess(process.repr, spawnProcess))
  );

  const waitingProcesses = new Map<number, Process>();

  tickLimit.init();

  const start = Date.now();
  const subdiv = [start + 20, start + 40, start + 60, start + 80];
  const delta = 1;

  // Execute processes until all Cpu is used
  while (tickLimit.getCurrentlyUsed() < 0.95) {
    const now = Date.now();

    // if (Math.abs(Date.now() - subdiv[0]) >= delta) {
    //   continue
    // }

    // subdiv.shift()

    // Copy current active processes
    const processes_ = new Map(processes);

    for (const [pid, process] of processes_) {
      // process.processSignals();

      // Check if process is sleeping
      if (Memory.processes[pid].sleepingUntil > now) {
        // console.log("sleeping", Memory.processes[pid].sleepingUntil)
        continue;
      }

      // Check if process is waiting for a message
      // TODO: type topic
      let topic: any;
      let message: any;

      if (waitingProcesses.has(pid)) {
        // Check if msg available
        // TODO: O(n^2) -> O(1) by storing in memory a Map<pid, topics[]>
        // TODO: call with array of messages instead of 1 at a time (if process is subscribing to multiple topics)
        let messageAvailable = false;

        for (const topic_ of Object.values(Memory.pubsub)) {
          if (topic_.listeners.some(value => value === pid) && topic_.messages.length !== 0) {
            topic = topic_;
            message = topic_.messages[0];
            messageAvailable = true;
            break;
          }
        }

        if (!messageAvailable) {
          continue;
        }
      }

      // Execute process until IO
      const { value, done } = process.tick.next(message);
      // Pop message
      if (message) {
        topic.messages.shift();
      }

      // If blocking IO, put process in waitingProcesses
      if (value.type === "wait") {
        waitingProcesses.set(pid, process);
      } else if (value.type === "sleep") {
        //TODO: process write to memory, not kernel
        Memory.processes[pid].sleepingUntil = value.data;
      }

      // Remove terminated process
      if (done) {
        processes.delete(pid);
      }
    }
  }

  // Re serialization
  // Memory.processes = Object.fromEntries(
  //   Array.from(processes.entries()).map(([pid, processObject]) => [
  //     pid,
  //     { repr: processObject.serialize(), memory: processObject.memory }
  //   ])
  // );

  global.processes = processes;
}

export function reset() {
  resetMemory();
}
