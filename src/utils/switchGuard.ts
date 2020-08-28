export function switchGuard(obj: never, source: string) {
  return new Error(`SwitchGuard: not expecting a value: ${source}, got ${obj}`);
}
