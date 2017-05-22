module.exports = function (config) {
	var webpackConfig = require('./webpack.config');
	webpackConfig.devtool = 'inline-source-map';
	webpackConfig.externals = [];
	
	var karmaConfig = {
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
			},
			FirefoxOnTravis: {
				base: 'Firefox',
				flags: ['--no-sandbox']
			}
		},
		singleRun: true,
		concurrency: Infinity
	};
	
	if (process.env.TRAVIS) {
		karmaConfig.browsers = ['FirefoxOnTravis'];
	}
	
	config.set(karmaConfig);
};