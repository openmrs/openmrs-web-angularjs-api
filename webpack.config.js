var webpack = require('webpack');
var path = require('path');
var env = require('yargs').argv.env;
var nodeExternals = require('webpack-node-externals');

var config = {
	entry: './src/index.js',
	output: {
		filename: 'index.js',
		path: path.resolve(__dirname, 'lib'),
		library: 'angularjs-openmrs-api',
		libraryTarget: 'umd',
		umdNamedDefine: true
	},
	module: {
		rules: [ {
			test: /\.js$/,
			exclude: /(node_modules)/,
			use: {
				loader: 'babel-loader?cacheDirectory',
				options: {
					presets: ['es2015']
				}
			}
		} ]
	},
	plugins: [],
	externals: [nodeExternals()]
};

if (env === 'dev') {
	
} else if (env === 'prod') {
	config.devtool = 'source-map';
	
	config.plugins.push(new webpack.optimize.UglifyJsPlugin({
		sourceMap: true,
		compress: {
			warnings: false
		}
	}));
}

module.exports = config;