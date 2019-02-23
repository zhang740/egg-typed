import * as tsNode from 'ts-node';
import * as fs from 'fs';
import * as path from 'path';

export function loadFile(path: string) {
  try {
    return require(path);
  } catch (err) {
    err.message = `[egg-typed] load file: ${path}, error: ${err.message}`;
    throw err;
  }
}

function getTSConfig(baseDir: string) {
  if (!fs.existsSync(path.join(baseDir, 'tsconfig.json'))) {
    console.warn('tsconfig.json NOT FOUND! path:', baseDir);
    return;
  }
  return JSON.parse(
    fs.readFileSync(path.join(baseDir, 'tsconfig.json'), { encoding: 'utf8' }) || '{}'
  );
}

export function registerTSNode(baseDir: string) {
  tsNode.register({
    ...getTSConfig(baseDir),
  });
}
