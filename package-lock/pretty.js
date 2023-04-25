const fs = require('fs');
const path = require('path');


const PROJECT_PATH = process.cwd();


module.exports = function pretty() {
  const pkg = JSON.parse(fs.readFileSync(path.resolve(PROJECT_PATH, 'package-lock.json')));

  const DIR = path.resolve(PROJECT_PATH);

  function drop(dependencies) {
    Object.keys(dependencies).forEach(lib => {
      const ref = dependencies[lib];
      delete ref.resolved;
      delete ref.integrity;
      delete ref.requires;
      delete ref.funding;
      if (ref.dependencies) {
        drop(ref.dependencies);
      }
    });
  }

  const app = pkg.name;
  const version = pkg.version;
  drop(pkg.packages);
  const dependencies = pkg.packages;
  delete dependencies[''];

  const pretty = JSON.stringify(dependencies, null, 2);
  fs.writeFileSync(path.resolve(DIR, './.head-cli/package-lock-pretty.json'), pretty, 'utf-8');

  return Promise.resolve();
};
