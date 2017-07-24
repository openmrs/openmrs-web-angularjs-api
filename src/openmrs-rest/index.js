/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
/**
 * The pattern borrowed from https://gist.github.com/brucecoddington/92a8d4b92478573d0f42
 */
import angular from 'angular';
import ngResource from 'angular-resource';

export default angular.module('angularjs-openmrs-api-rest', ['ngResource'])
	.value('openmrsContextConfig', { })
	.factory('openmrsContext', openmrsContext)
	.factory('openmrsApi', openmrsApi)
	.factory('authInterceptor', authInterceptor)
	.config(httpProviderConfig)
	.provider('openmrsRest', openmrsRest).name;

openmrsContext.$inject = ['$http', '$q', '$window', 'openmrsContextConfig'];
function openmrsContext($http, $q, $window, openmrsContextConfig){
	function handleNoConfig(){
		setBaseAppPath('/owa/');
	}

	function setBaseAppPath(url) {
		var path = $window.location.pathname;
		path = path.substring(0, path.indexOf(url));
		if (path.endsWith("/")) {
			path = path.substring(0, path.length - 1);
		}
        openmrsContextConfig.href = path;
	}

	function getConfig(){
		var deferred = $q.defer();

		if (angular.isDefined(openmrsContextConfig.href)) {
			deferred.resolve(openmrsContextConfig);
		} else if (typeof OPENMRS_CONTEXT_PATH !== 'undefined') {
			openmrsContextConfig.href = OPENMRS_CONTEXT_PATH;
			deferred.resolve(openmrsContextConfig);
		} else {
			$http.get('manifest.webapp').then(
				function(response){
					if(response.data.activities.openmrs.testConfig){
						openmrsContextConfig.href = response.data.activities.openmrs.testConfig.href;
						openmrsContextConfig.test = true;
						
						$http.defaults.headers.common['Disable-WWW-Authenticate'] = false;
						$http.defaults.withCredentials = true;
						
						deferred.resolve(openmrsContextConfig);								
					} else {
						handleNoConfig();
						deferred.resolve(openmrsContextConfig);
					}
				},
				function(error) {
					handleNoConfig();
					deferred.resolve(openmrsContextConfig);
				}
			);
		}

		return deferred.promise;
	}
	return {
		getConfig: getConfig,
		setBaseAppPath: setBaseAppPath
	}
}

authInterceptor.$inject = ['$q', '$window', 'openmrsContextConfig'];
function authInterceptor($q, $window, openmrsContextConfig){
	return {
		responseError: function(response){
			var redirectUrl = $window.location.href;
			redirectUrl = redirectUrl.replace('#','_HASHTAG_');

			if(!openmrsContextConfig.test && (response.status === 401 || response.status === 403)){
				if($window.confirm("The operation cannot be completed, because you are no longer logged in. Do you want to go to login page?")){
					var loginUrl = openmrsContextConfig.href + '/login.htm?redirect_url=' + redirectUrl;
					$window.location.href = loginUrl;
				}
			}
			
			return $q.reject(response);
		}
	}
}

httpProviderConfig.$inject = ['$httpProvider'];
function httpProviderConfig($httpProvider){
	$httpProvider.interceptors.push('authInterceptor');
	$httpProvider.defaults.headers.common['Disable-WWW-Authenticate'] = 'true';
}

function getBasePath(pathname) {
	return pathname.substring(0, pathname.indexOf('/owa/'));
}

openmrsApi.$inject = ['$resource', '$q', 'openmrsContext'];
function openmrsApi($resource, $q, openmrsContext) {	
	var openmrsApi = {
		defaultConfig: {
			uuid: '@uuid'
		},
		add: add
	};

	return openmrsApi;

	function add(config) {
		var deferred = $q.defer();
		openmrsContext.getConfig().then(function(openmrsContextConfig){
			var params, url;

			// If the add() function is called with a
			// String, create the default configuration.
			if (angular.isString(config)) {
				var configObj = {
					resource: config,
					url: '/' + config
				};

				config = configObj;
			}

			// If the url follows the expected pattern, we can set cool defaults.
			if (!config.unnatural) {
				var orig = angular.copy(openmrsApi.defaultConfig);
				params = angular.extend(orig, config.params);
				url = openmrsContextConfig.href + '/ws/rest/v1' + config.url + '/:uuid';
			} else {
				// Otherwise we have to declare the entire configuration.
				params = config.params;
				url = openmrsContextConfig.href + '/ws/rest/v1' + config.url + '/:uuid';
			}

			// If we supply a method configuration, use that instead of the default extra.
			var actions = config.actions || openmrsApi.extraActions;

			openmrsApi[config.resource] = $resource(url, params, actions);
			deferred.resolve(openmrsApi[config.resource]);
		})
		return deferred.promise;
	}
}


function openmrsRest() {
	return {
		list: provideList,
		get: provideGet,
		$get: ['openmrsApi', '$document', '$q', 'openmrsContext', function(openmrsApi, $document, $q, openmrsContext){
			return provideOpenmrsRest(openmrsApi, $document, $q, openmrsContext);
		}]
	};

	function provideList(resource, query) {
		return ['openmrsRest', function (openmrsRest) {
			return openmrsRest.list(resource, query);
		}]
	}

	function provideGet(resource, query) {
		return ['openmrsRest', function (openmrsRest) {
			return openmrsRest.get(resource, query);
		}]
	}

	function provideOpenmrsRest(openmrsApi, $document, $q, openmrsContext) {
		var openmrsRest = {
			list: list,
			listFull: listFull,
			listRef: listRef,
			get: get,
			getFull: getFull,
			getRef: getRef,
			create: create,
			update: update,
			remove: remove,
			retire: remove,
			unretire: unretire,
			purge: purge,
			getServerUrl: getServerUrl,
            setBaseAppPath: setBaseAppPath
		};

		return openmrsRest;

		function getServerUrl() {
			var deferred = $q.defer();
			openmrsContext.getConfig().then(function (openmrsContextConfig) {
				deferred.resolve(openmrsContextConfig.href);
			});
			return deferred.promise;
		}

		function setBaseAppPath(url) {
			openmrsContext.setBaseAppPath(url);
        }

		function list(resource, query) {
			return openmrsApi.add(resource).then(function(resource){
				return resource.get(query).$promise.then(function (response) {
					return new PartialList(response, $document);
				});
			});
		}

		function listFull(resource, query) {
			query = addMode(query, 'full');
			return list(resource, query);
		}

		function listRef(resource, query) {
			query = addMode(query, 'ref');
			return list(resource, query);
		}

		function get(resource, query) {
			return openmrsApi.add(resource).then(function(resource){
				return resource.get(query).$promise.then(function (response) {
					return response;
				});
			});
		}

		function getFull(resource, query) {
			query = addMode(query, 'full');
			return get(resource, query);
		}

		function getRef(resource, query) {
			query = addMode(query, 'ref');
			return get(resource, query);
		}

		function create(resource, model) {
			return openmrsApi.add(resource).then(function(resource){
				return resource.save(model).$promise.then(function (response) {
					return response;
				});
			});
		}

		function update(resource, model) {
			return openmrsApi.add(resource).then(function(resource){
				return resource.save({uuid: model.uuid}, model).$promise.then(function (response) {
					return response;
				});
			});
		}

		function remove(resource, model, retireReason) {
			return openmrsApi.add(resource).then(function(resource){
				return resource.remove({uuid: model.uuid, reason: retireReason}).$promise.then(function (response) {
					return response;
				});
			});
		}

		function unretire(resource, model) {
			return openmrsApi.add(resource).then(function(resource){
				return resource.save({uuid : model.uuid}, {retired: false}).$promise.then(function (response) {
					return response;
				});
			});
		}

		function purge(resource, model) {
			var query = {uuid: model.uuid};
			if (query == null) {
				query = {purge: true};
			} else {
				angular.extend(query, {purge: true});
			}
			return openmrsApi.add(resource).then(function(resource){
				return resource.remove(query).$promise.then(function (response) {
					return response;
				});
			});
		}

		function addMode(query, type) {
			if (query == null) {
				return {v: type};
			} else {
				return angular.extend(query, {v: type});
			}
		}
	}
}

function PartialList(response, doc) {
	var results = response.results;
	var nextQuery = null;
	var previousQuery = null;

	initLinks();

	return {
		results: results,
		hasNext: hasNext,
		nextQuery: nextQuery,
		hasPrevious: hasPrevious,
		previousQuery: previousQuery
	};

	function hasNext() {
		return nextQuery != null;
	}

	function hasPrevious() {
		return previousQuery != null;
	}

	function initLinks() {
		if (response.links != null) {
			for (var i = 0; i < response.links.length; i++) {
				var link = response.links[i];

				if (link.rel === 'next') {
					nextQuery = toQuery(link.uri);
				} else if (link.rel === 'prev') {
					previousQuery = toQuery(link.uri);
				}
			}
		}
	}

	function toQuery(href) {
		var parser = doc[0].createElement('a');
		parser.href = href;
		var params = parser.search.slice(1).split('&');
		var result = {}; 
		params.forEach(function(param) {
			if(param !== ''){
				param = param.split('=');
				result[param[0]] = decodeURIComponent(param[1] || '');
			}
		});
		return result;
	}
}
