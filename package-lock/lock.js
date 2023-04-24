const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;
const pretty = require('./pretty');
const deps = require('./deps');


const PROJECT_PATH = process.cwd();


module.exports = function lock() {
  pretty();

  const pkg = JSON.parse(fs.readFileSync(path.resolve(PROJECT_PATH, 'package-lock.json')));

  const DIR = path.resolve(PROJECT_PATH);

  const dependencies = [];
  function flat(pkgs) {
    Object.keys(pkgs).forEach(location => {
      if (location) {
        const ref = pkgs[location];
        const importers = location.split('node_modules').map(lib => lib.replace(/^\//, '').replace(/\/$/, '')).filter(lib => lib);
        const self = importers.pop();
        dependencies.push({ name: self, version: ref.version, importer: importers.join(' / ') });
      }
    });
  }

  flat(pkg.packages);

  dependencies.sort(function (a, b) {
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

  const v2 = JSON.stringify(dependencies, null, 2);
  fs.writeFileSync(path.resolve(DIR, './.head-cli/package-lock-rfc.json'), v2, 'utf-8');
  const core = dependencies.filter(lib => deps(lib.name));
  const v2Core = JSON.stringify(core, null, 2);
  fs.writeFileSync(path.resolve(DIR, './.head-cli/package-lock-core.json'), v2Core, 'utf-8');

  function pend(importers, dept) {
    if (dept.dependents && dept.dependents.length > 0) {
      for (let i = 0; i < dept.dependents.length; i += 1) {
        const { from } = dept.dependents[i];
        if (from.name) {
          return pend(importers.map(p => `${from.name} / ${p}`), from);
        } else {
          return importers;
        }
      }
    } else {
      if (dept.name) {
        return importers.map(p => `${dept.name} / ${p}`);
      } else {
        return importers;
      }
    }
  }

  function explain(lib, version) {
    const dependents = JSON.parse(execSync(`npm explain ${lib}@${version} --json`, { maxBuffer: 1024 * 1024 * 30 }).toString().trim());
    const importers = dependents.reduce((prev, dept) => prev.concat(pend([`${lib}@${version}`], dept)), []);
    return importers.map(p => {
      const ps = p.split(' / ');
      ps.pop();
      return ps.join(' / ');
    });
  }

  function odd(dependencies) {
    const odds = {};
    dependencies.forEach(d => {
      if (d.importer) {
        odds[`${d.name},${d.version}`] = d.importer; // Set
      }
    });

    Object.keys(odds).forEach(key => {
      const [name, version] = key.split(',');
      const importers = explain(name, version);

      const delStart = dependencies.findIndex(p => p.name === name && p.version === version);
      const delCount = dependencies.filter(p => p.name === name && p.version === version).length;
      // ** 这里因为前面排过序了
      dependencies.splice(delStart, delCount, ...importers.map(importer => ({ name, version, importer })));
    })
  }

  odd(core);

  const npm = [
    { name: 'node', version: execSync('node -v').toString().trim().replace(/^v/, ''), importer: 'node' },
    { name: 'npm', version: execSync('npm -v').toString().trim().replace(/^v/, ''), importer: 'npm' },
  ];

  const report = JSON.stringify([].concat(core).concat(npm), null, 2);
  fs.writeFileSync(path.resolve(DIR, './.head-cli/inspect-package-lock.json'), report, 'utf-8');

  return Promise.resolve();
};
