const fs = require('fs');
const path = require('path');


const PROJECT_PATH = process.cwd();
const configFile = path.resolve(PROJECT_PATH, '.head-cli.config.js');


const byPrefix = [
  '@babel/preset-', '@babel/plugin-',
  'eslint-plugin-',
  // core
  '@vue/',
  // ui core
  '@vant/',
  // deprecated
  'babel-preset-', 'babel-plugin-',
];


const byExact = [
  // NOTE: build
  '@babel/core', '@babel/plugin-transform-runtime', '@babel/runtime', '@babel/template', '@babel/generator', '@babel/preset-env', '@babel/types',
  'core-js', 'browserslist', 'source-map',
  'babel-loader', 'webpack', 'webpack-cli', 'webpack-chain', 'webpack-merge', 'terser', 'terser-webpack-plugin', 'url-loader',
  'vue-loader', 'vue-style-loader', 'vue-template-compiler',
  'assets-webpack-plugin', 'css-loader', 'cssnano', 'mini-css-extract-plugin', 'optimize-css-assets-webpack-plugin',
  'postcss', 'postcss-calc', 'postcss-import', 'postcss-loader', 'postcss-ordered-values', 'postcss-simple-vars', 'postcss-url',
  'autoprefixer',
  'gulp', 'json-loader', 'uglify-js',
  // NOTE: dev
  'style-loader',
  'babel-eslint', 'eslint', 'eslint-config-airbnb', 'eslint-config-airbnb-base', 'eslint-import-resolver-node', 'eslint-import-resolver-webpack', 'eslint-loader',
  'stylelint', 'stylelint-config-recommended', 'stylelint-config-standard', 'stylelint-webpack-plugin',
  'webpack-bundle-analyzer', 'webpack-dev-middleware', 'webpack-dev-server',
  'vconsole', 'vconsole-webpack-plugin',
  // NOTE: core
  'axios', 'dayjs', 'react', 'react-dom', 'prop-types', 'react-redux', 'react-router', 'react-router-redux', 'redux', 'redux-saga', 'immutable',
  'path-to-regexp',
  'vue', 'vue-router', 'vuex',
  'lodash', 'lodash-es', 'vanilla.js',
  // NOTE: ui core
  'antd', 'rc-form', 'rc-menu', 'rc-table', 'rc-tabs', 'react-contextmenu',
  'dva-core', 'dva-react-router-3', 'dva-loading', 'antd-dayjs-webpack-plugin',
  'draft-js',
  'vant',
  // NOTE: deprecated
  'babel-runtime', 'babel-core', 'babel-polyfill',
  '@babel/runtime-corejs3',
  'gulp-replace', 'classnames', 'happypack', 'moment', 'run-sequence', 'uglifyjs-webpack-plugin',
  // NOTE:
  // 'ajv', 'acron', 'yargs', 'minimatch', 'minimist', 'graceful-fs', 'chokidar'
];

const skipExact = [
  'debug', 'commander', 'json5', 'ms', 'semver', 'supports-color',
];


if (fs.existsSync(configFile)) {
  const config = require(configFile)['package-lock'] || {};
  if (config.dependencies) {
    config.dependencies.forEach(function (pattern) {
      if (pattern.startsWith('--')) {
        const idx = skipExact.findIndex(lib => lib === pattern.substring(2));
        if (idx > -1) {
          skipExact.splice(idx, 1);
        }
      } else if (pattern.startsWith('-')) {
        skipExact.push(pattern.substring(1));
      } else {
        if (pattern.endsWith('*')) {
          byPrefix.push(pattern.substring(0, pattern.length - 1));
        } else {
          byExact.push(pattern);
        }
      }
    });
  }
}


module.exports = function (lib) {
  if (skipExact.indexOf(lib) > -1) {
    return false;
  }

  for (let i = 0; i < byPrefix.length; i += 1) {
    if (lib.indexOf(byPrefix[i]) === 0) {
      return true;
    }
  }
  return byExact.indexOf(lib) > -1;
};
