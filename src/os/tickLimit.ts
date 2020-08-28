export function buildSimulationTickLimit() {
  let startTime: number;
  const limit = 100;

  function init() {
    startTime = Date.now();
  }

  function getCurrentlyUsed() {
    return (Date.now() - startTime) / limit;
  }

  return {
    init,
    getCurrentlyUsed
  };
}

export function buildProductionTickLimit() {
  function init() {}

  function getCurrentlyUsed() {
    return Game.cpu.getUsed() / Game.cpu.tickLimit;
  }

  return {
    init,
    getCurrentlyUsed
  };
}

export function isSimulationMode() {
  return !Number.isFinite(Game.cpu.tickLimit);
}

export function buildTickLimit() {
  if (isSimulationMode()) {
    return buildSimulationTickLimit();
  }

  return buildProductionTickLimit();
}
