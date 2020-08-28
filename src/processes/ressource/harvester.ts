import { priorityExecute } from "utils/priorityExecute";

export function harvest(creep: Creep, source: Source): boolean {
  const room = creep.room;

  if (creep.store[RESOURCE_ENERGY] < creep.store.getCapacity()) {
    creep.say("going to source");
    // Harvest
    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
      creep.moveTo(source, { visualizePathStyle: { stroke: "#FFAA00" } });
    }
  } else {
    creep.say("coming back");
    // Carry
    const targets = room.find(FIND_MY_STRUCTURES, {
      filter: structure => {
        if (
          structure.structureType === STRUCTURE_EXTENSION ||
          structure.structureType === STRUCTURE_SPAWN ||
          structure.structureType === STRUCTURE_TOWER
        ) {
          return structure.energy < structure.energyCapacity;
        }

        if (structure.structureType === STRUCTURE_CONTROLLER) {
          return true;
        }

        return false;
      }
    });

    if (targets.length > 0) {
      if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(targets[0], { visualizePathStyle: { stroke: "#FFFFFF" } });
      }
    }
  }

  return true;
}

export function recycle(
  creep: Creep,
  source: Source,
  spawn: StructureSpawn
): boolean {
  const pathLengthToSpawn = creep.pos.findPathTo(spawn).length;

  if (creep.ticksToLive === pathLengthToSpawn) {
    creep.moveTo(spawn);

    if (pathLengthToSpawn < 1) {
      spawn.recycleCreep(creep);
    }

    return true;
  }

  return false;
}

export function harvester(
  creep: Creep,
  source: Source,
  spawn: StructureSpawn
): void {
  priorityExecute([
    () => recycle(creep, source, spawn),
    () => harvest(creep, source)
  ]);
}
