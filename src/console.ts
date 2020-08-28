import * as kernel from "os/kernel";
import { spawnProcess } from "os/spawn";

Object.defineProperty(global, "reset", {
  configurable: true,
  enumerable: true,
  get() {
    return kernel.reset();
  }
});

Object.defineProperty(global, "ps", {
  configurable: true,
  enumerable: true,
  get() {
    return kernel.displayProcessTable();
  }
});

Object.defineProperty(global, "launch", {
  configurable: true,
  enumerable: true,
  get() {
    spawnProcess("Talker");
    spawnProcess("Listener");
  }
});

global.kill = (pid: number) => kernel.killProcess(-1, pid);
