export function harvest(creep: Creep, source: Source): void {
  const room = creep.room;

  if (creep.carryCapacity === 0 || creep.carry.energy < creep.carryCapacity) {
    // Harvest
    if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
      creep.moveTo(source, { visualizePathStyle: { stroke: "#FFAA00" } });
    }
  } else {
    console.log("harvester gonna carry some shit");
    // Carry
    const targets = room.find(FIND_MY_STRUCTURES, {
      filter: structure => {
        return (
          (structure.structureType === STRUCTURE_EXTENSION ||
            structure.structureType === STRUCTURE_SPAWN ||
            structure.structureType === STRUCTURE_TOWER) &&
          structure.energy < structure.energyCapacity
        );
      }
    });

    if (targets.length > 0) {
      if (creep.transfer(targets[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        creep.moveTo(targets[0], { visualizePathStyle: { stroke: "#FFFFFF" } });
      }
    }
  }
}
