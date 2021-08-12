const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;
const deps = require('./deps');


const PROJECT_PATH = process.cwd();


module.exports = function lock() {
  const pkg = JSON.parse(fs.readFileSync(path.resolve(PROJECT_PATH, 'package-lock.json')));

  const DIR = path.resolve(PROJECT_PATH);

  function drop(dependencies) {
    Object.keys(dependencies).forEach(lib => {
      const ref = dependencies[lib];
      delete ref.resolved;
      delete ref.integrity;
      delete ref.requires;
      if (ref.dependencies) {
        drop(ref.dependencies);
      }
    });
  }

  const app = pkg.name;
  const version = pkg.version;
  drop(pkg.dependencies);
  const dependencies = pkg.dependencies;

  const pretty = JSON.stringify(dependencies, null, 2);
  fs.writeFileSync(path.resolve(DIR, './.seed-cli/package-lock-pretty.json'), pretty, 'utf-8');

  function pick(dependencies) {
    Object.keys(dependencies).forEach(lib => {
      const ref = dependencies[lib];
      if (ref.dependencies) {
        pick(ref.dependencies);
      }
      if (!ref.dependencies || Object.keys(ref.dependencies).length === 0) {
        if (!deps(lib)) {
          delete dependencies[lib];
        }
      }
      if (ref.dependencies && Object.keys(ref.dependencies).length === 0) {
        delete ref.dependencies;
      }
    });
  }

  pick(pkg.dependencies);
  const core = JSON.stringify(pkg.dependencies, null, 2);
  fs.writeFileSync(path.resolve(DIR, './.seed-cli/package-lock-core.json'), core, 'utf-8');

  const reduce = [];
  function flat(ns, dependencies) {
    Object.keys(dependencies).forEach(lib => {
      const ref = dependencies[lib];
      const n = ns ? `${ns} / ${lib}` : lib;
      if (ref.dependencies) {
        flat(n, ref.dependencies);
      }
      reduce.push({ name: lib, version: ref.version, importer: n });
    });
  }

  flat('', pkg.dependencies);

  reduce.sort(function (a, b) {
    if (a.name > b.name) {
      return 1;
    } else if (a.name < b.name) {
      return -1;
    } else {
      if (a.version < b.version) {
        return 1;
      } else if (a.version > b.version) {
        return -1;
      } else {
        if (a.importer > b.importer) {
          return 1;
        } else if (a.importer < b.importer) {
          return -1;
        } else {
          return 0;
        }
      }
    }
  });

  const npm = [
    { name: 'node', version: execSync('node -v').toString().trim().replace(/^v/, ''), importer: 'node' },
    { name: 'npm', version: execSync('npm -v').toString().trim().replace(/^v/, ''), importer: 'npm' },
  ];

  const report = JSON.stringify([].concat(reduce).concat(npm), null, 2);
  fs.writeFileSync(path.resolve(DIR, './.seed-cli/package-lock-core-report.json'), report, 'utf-8');

  return Promise.resolve();
};
