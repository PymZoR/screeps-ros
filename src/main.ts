import "console";
import * as kernel from "os/kernel";
import { ErrorMapper } from "utils/ErrorMapper";

function main() {
  // console.log(`Current game tick is ${Game.time}`);
  // displayProcessTable()

  kernel.init();

  kernel.loop();
}

export const loop = ErrorMapper.wrapLoop(main);
