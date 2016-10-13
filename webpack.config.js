// require('babel-register');

const env = process.env;
const NODE_ENV = process.env.NODE_ENV;
const isDev  = NODE_ENV === 'development';
const isTest = NODE_ENV === 'test';

const webpack = require('webpack');
const marked  = require('marked');
const fs      = require('fs');
const path    = require('path'),
      join    = path.join,
      resolve = path.resolve;

const root  = resolve(__dirname);
const src   = join(root, 'src');
const app = join(root, 'app');
const modules = join(root, 'node_modules');
const dest  = join(root, 'public');

const getConfig = require('hjs-webpack')

var config = getConfig({
  isDev,
  in: join(app, 'index.js'),
  out: dest,
  clearBeforeBuild: true,
  html: function(context, cb) {
    context.publicPath = isDev ? 'http://localhost:3000/' : ''

    fs.readFile(join(root, 'README.md'), (err, data) => {
      if (err) {
        return cb(err);
      }
      cb(null, {
        'index.html': context.defaultTemplate(),
      })
    })
  }
});

const dotenv      = require('dotenv');
const envVariables = dotenv.config();
console.log(envVariables);
console.log("hi1");
// Converts keys to be surrounded with __
const defines =
  Object.keys(envVariables)
  .reduce((memo, key) => {
    const val = JSON.stringify(envVariables[key]);
    memo[`__${key.toUpperCase()}__`] = val;
    return memo;
  }, {
    __NODE_ENV__: JSON.stringify(env.NODE_ENV),
    __IS_DEV__: isDev,
    __GMAP__: JSON.stringify(env.GAPI_KEY),
  })


config.externals = {
  'window.google': true
}

// Setup css modules require hook so it works when building for the server
const cssModulesNames = `${isDev ? '[path][name]__[local]__' : ''}[hash:base64:5]`;
const matchCssLoaders = /(^|!)(css-loader)($|!)/;

const findLoader = (loaders, match, fn) => {
  const found = loaders.filter(l => l && l.loader && l.loader.match(match))
  return found ? found[0] : null;
}

const cssloader = findLoader(config.module.loaders, matchCssLoaders);
const newloader = Object.assign({}, cssloader, {
  test: /\.module\.css$/,
  include: [src, app],
  loader: cssloader.loader.replace(matchCssLoaders, `$1$2?modules&localIdentName=${cssModulesNames}$3`)
})
config.module.loaders.push(newloader);
cssloader.test = new RegExp(`[^module]${cssloader.test.source}`)
cssloader.loader = 'style!css!postcss'

cssloader.include = [src, app];

config.module.loaders.push({
  test: /\.css$/,
  include: [modules],
  loader: 'style!css'
});


config.plugins = [
  new webpack.DefinePlugin(defines)
].concat(config.plugins);

config.postcss = [].concat([
  require('precss')({}),
  require('autoprefixer')({}),
  require('cssnano')({})
])

module.exports = config;
