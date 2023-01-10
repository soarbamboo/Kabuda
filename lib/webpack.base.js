const autoprefixer = require('autoprefixer');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const glob = require('glob');
const path = require('path');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const projectRoot = process.cwd();
// 4、多页面打包
const setMPA = () => {
  const entry = {};
  const htmlWebpackPlugins = [];
  const entryFiles = glob.sync(path.join(projectRoot, './src/*/index.js'));

  Object.keys(entryFiles).map((index) => {
    const entryFile = entryFiles[index];
    // '/Users/cpselvis/my-project/src/index/index.js'

    const match = entryFile.match(/src\/(.*)\/index\.js/);
    const pageName = match && match[1];

    entry[pageName] = entryFile;
    return htmlWebpackPlugins.push(
      new HtmlWebpackPlugin({
        // 内嵌文件类型
        inlineSource: '.css$',
        template: path.join(projectRoot, `./src/${pageName}/index.html`),
        filename: `${pageName}.html`,
        chunks: ['vendors', pageName],
        /**
         * 向template或者templateContent中注入所有静态资源，不同的配置值注入的位置不经相同
         *  1、true或者body：所有JavaScript资源插入到body元素的底部
         *  2、head: 所有JavaScript资源插入到head元素中
         *  3、false： 所有静态资源css和JavaScript都不会注入到模板文件中
         */
        inject: true,
        minify: {
          html5: true,
          collapseWhitespace: true, // 清理html中的空格、换行符 默认为false
          preserveLineBreaks: false,
          minifyCSS: true, // 压缩html内的样式。默认为false
          minifyJS: true, // 压缩html内的js。默认为false
          removeComments: false, // 清理html中的注释。默认为false
          removeEmptyElements: false, // 清理内容为空的元素。 默认为false
          caseSensitive: false, // 以区分大小写的方式处理自定义标签内的属性。默认为false
          removeScriptTypeAttributes: false, // 去掉script标签的type属性 默认为false
          removeStyleLinkTypeAttributes: false, // 去掉style和link标签的type属性。默认为false
        },
      }),
    );
  });

  return {
    entry,
    htmlWebpackPlugins,
  };
};

const { entry, htmlWebpackPlugins } = setMPA();

module.exports = {
  // 1、资源解析
  module: {
    entry,
    rules: [
      {
        test: /.js$/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
      {
        test: /.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'less-loader',
          // 2、样式增强
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [
                autoprefixer({
                  browsers: ['last 2 version', '>1%', 'ios 7'],
                }),
              ],
            },
          },
          // 2、样式增强
          {
            loader: 'px2rem-loader',
            options: {
              remUnit: 75,
              remPrecision: 8,
            },
          },
        ],
      },
      {
        test: /.(png|jpg|gif|jpeg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name]_[hash:8].[ext]',
            },
          },
        ],
      },
      {
        test: /.(woff|woff2|eot|ttf|otf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name]_[hash:8][ext]',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      // 7、CSS单独提取为一个文件
      filename: '[name]_[contenthash:8].css',
    }),
    new CleanWebpackPlugin(), // 3、目录清理
    new FriendlyErrorsWebpackPlugin(), // 5、命令行信息显示优化
    function errorPlugin() {
      // 6、错误捕获和处理
      this.hooks.done.tap('done', (stats) => {
        if (
          stats.compilation.errors
          && stats.compilation.errors.length
          && process.argv.indexOf('--watch') === -1
        ) {
          process.exit(1);
        }
      });
    },
  ].concat(htmlWebpackPlugins),
  stats: 'errors-only', // 5、命令行信息显示优化
};
