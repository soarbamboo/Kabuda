const path = require('path');
const webpack = require('webpack');
const rimraf = require('rimraf'); // 用来构建前删除dist目录
const Mocha = require('mocha');

process.chdir(path.join(__dirname, 'template')); // 确定执行脚本的具体目录地址

rimraf('./dist', () => {
  // 删除dist目录后执行操作
  const prodConfig = require('../../lib/webpack.prod.js');
});
