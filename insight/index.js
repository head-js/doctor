const fs = require('fs');
const path = require('path');
const dirCommand = require('@babel/cli/lib/babel/dir').default;


const PROJECT_PATH = process.cwd();


module.exports = function insight() {
  const pkg = JSON.parse(fs.readFileSync(path.resolve(PROJECT_PATH, 'package.json')));

  const DIR = path.resolve(PROJECT_PATH);

  // console.log(pkg.name);
  // console.log(DIR);

  const babelOptions = {
    plugins: [
      '@babel/plugin-syntax-jsx',
    ],
    presets: [
    ],
  };
  const cliOptions = {
    filenames: [ 'src' ],
    // extensions: [ '.js', '.jsx', '.vue' ],
    outDir: '.head-cli/src-insight',
    verbose: true,
  };
  const opts = { babelOptions, cliOptions };
  // console.log(opts);

  return dirCommand(opts);
};
