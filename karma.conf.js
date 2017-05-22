var webpackConfig = require('./webpack.config');
webpackConfig.devtool = 'inline-source-map';
webpackConfig.externals = [];

module.exports = function (config) {
	config.set({
		basePath: './src',
		frameworks: ['jasmine'],
		files: [
			'./test-index.js'
		],
		exclude: [],
		preprocessors: {
			"./test-index.js": ["webpack", "sourcemap"]
		},
		plugins: [
			require('karma-jasmine'),
			require('karma-chrome-launcher'),
			require('karma-firefox-launcher'),
			require("karma-webpack"),
			require('karma-sourcemap-loader'),
			require('karma-coverage')
		],
		
		webpack: webpackConfig,
		webpackMiddleware: {
			stats: "errors-only"
		},
		reporters: ['progress'],
		port: 9876,
		colors: true,
		logLevel: config.LOG_INFO,
		autoWatch: true,
		browsers: ['ChromeWithoutSecurity'],
		customLaunchers: {
			ChromeWithoutSecurity: {
				base: 'Chrome',
				flags: ['--disable-web-security']
			}
		},
		singleRun: true,
		concurrency: Infinity
	});
};