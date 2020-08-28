import { ErrorMapper } from "utils/ErrorMapper";
import * as kernel from "os/kernel";
import "console";

function main() {
  // console.log(`Current game tick is ${Game.time}`);
  // displayProcessTable()

  kernel.init();

  kernel.loop();
}

export const loop = ErrorMapper.wrapLoop(main);
