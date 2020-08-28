export function switchGuard(obj: never, source: string): Error {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  return new Error(`SwitchGuard: not expecting a value: ${source}, got ${obj}`);
}
