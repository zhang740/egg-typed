import * as tsNode from 'ts-node';
import * as fs from 'fs';
import * as path from 'path';
// import * as tsConfigPaths from 'tsconfig-paths';

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
    console.warn('tsconfig.json NOT FOUND!');
    return;
  }
  return JSON.parse(
    fs.readFileSync(path.join(baseDir, 'tsconfig.json'), { encoding: 'utf8' }) || '{}'
  );
}

export function registerTSNode(baseDir: string) {
  tsNode.register({
    ...getTSConfig(baseDir),
    transformers: {
      before: [],
    }
  });
}

// export function registerTSConfigPaths(baseDir: string) {
//   const tsConfig = getTSConfig(baseDir);
//   if (tsConfig.compilerOptions && tsConfig.compilerOptions.paths) {
//     tsConfigPaths.register({
//       baseUrl: baseDir,
//       paths: getTSConfig(baseDir).compilerOptions.paths
//     });
//   }
// }
