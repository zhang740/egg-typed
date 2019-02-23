import * as path from 'path';
import { fork as cpFork, ForkOptions } from 'child_process';

export function fork(
  /** for ts-node */
  baseDir: string,
  modulePath: string,
  args?: ReadonlyArray<string>,
  options?: ForkOptions
) {
  return cpFork(path.join(__dirname, 'bridge.js'), [baseDir, modulePath, ...(args || [])], options);
}
