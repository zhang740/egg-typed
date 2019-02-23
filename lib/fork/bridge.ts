import * as path from 'path';
import { registerTSNode } from '../loader_util';

const args = process.argv.splice(2, 2);
const baseDir = args[0];
const filePath = args[1];
process.argv[1] = filePath;

registerTSNode(baseDir);
require(filePath);
