import * as path from 'path';
import { fork as cpFork, ChildProcess } from 'child_process';

export function fork(baseDir: string, filePath: string) {
  return cpFork(path.join(__dirname, './bridge.js'), [baseDir, filePath]);
}
