import * as path from 'path';
import { registerTSNode } from '../loader_util';

const args = process.argv;

const baseDir = args[args.length - 2];
const filePath = args[args.length - 1];

registerTSNode(baseDir);

let func = require(path.join(baseDir, filePath));

if ('default' in func) {
  func = func.default;
}

if (func instanceof Function) {
  func();
}
