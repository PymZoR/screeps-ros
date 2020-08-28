export function priorityExecute(executionList: (() => boolean)[]): void {
  for (const execution of executionList) {
    if (execution()) {
      break;
    }
  }
}
