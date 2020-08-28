import { Process, ProcessMessage } from "os/process";
import { harvest } from "./harvester";

interface RessourceMemory {
  harvestersCount: number;
}

export class Ressource extends Process<RessourceMemory> {
  public getType(): ProcessType {
    return "Ressource";
  }

  public countWorkablePositions(room: Room, position: RoomPosition): number {
    const terrain = Game.map.getRoomTerrain(room.name);
    let workablePositions = 0;

    // Find adjacent positions
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const positionType = terrain.get(position.x + dx, position.y + dy);
        if (positionType !== TERRAIN_MASK_WALL) {
          workablePositions++;
        }
      }
    }

    return workablePositions;
  }

  public getBestSourcesToHarvest(spawn: StructureSpawn): { source: Source; neededWorkerAmount: number }[] {
    const roomSources = spawn.room.find(FIND_SOURCES);

    const result: { source: Source; neededWorkerAmount: number }[] = [];

    for (const source of roomSources) {
      const { pos, room } = source;

      const maxWorkers = this.countWorkablePositions(room, pos);

      result.push({
        source,
        neededWorkerAmount: maxWorkers - this.memory.harvestersCount
      });
    }

    return result;
  }

  public *execute(): Generator<ProcessMessage, void, Record<string, unknown>> {
    // setup
    const spawn = Game.spawns[Object.keys(Game.spawns)[0]];

    this.memory.harvestersCount = this.memory.harvestersCount ?? spawn.room.find(FIND_MY_CREEPS).length;

    const bestSources = this.getBestSourcesToHarvest(spawn);
    const nextSource = bestSources[0];

    if (nextSource?.neededWorkerAmount > 0) {
      const spawnCreepOutcome = spawn.spawnCreep(
        ["move", "work", "carry"],
        `${spawn.room.name}/polyvalent-harvester-${this.memory.harvestersCount}`
      );

      if (spawnCreepOutcome === OK) {
        this.memory.harvestersCount += 1;
      }
    }

    const creeps = spawn.room.find(FIND_MY_CREEPS);

    if (nextSource) {
      for (const creep of creeps) {
        harvest(creep, nextSource.source);
      }
    }

    yield { type: "sleep", data: Date.now() + 50 };
  }

  public onSIGINT(): void {
    console.log(`${this.pid} - Ressource SIGINT`);
  }
}
