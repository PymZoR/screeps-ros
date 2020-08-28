interface TickLimit {
  init: () => void;
  getCurrentlyUsed: () => number;
}

export function buildSimulationTickLimit(): TickLimit {
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

export function buildProductionTickLimit(): TickLimit {
  function init() {
    return;
  }

  function getCurrentlyUsed() {
    return Game.cpu.getUsed() / Game.cpu.tickLimit;
  }

  return {
    init,
    getCurrentlyUsed
  };
}

export function isSimulationMode(): boolean {
  return !isFinite(Game.cpu.tickLimit);
}

export function buildTickLimit(): TickLimit {
  if (isSimulationMode()) {
    return buildSimulationTickLimit();
  }

  return buildProductionTickLimit();
}
