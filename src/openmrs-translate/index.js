/*
 * This Source Code Form is subject to the terms of the Mozilla Public License,
 * v. 2.0. If a copy of the MPL was not distributed with this file, You can
 * obtain one at http://mozilla.org/MPL/2.0/. OpenMRS is also distributed under
 * the terms of the Healthcare Disclaimer located at http://openmrs.org/license.
 *
 * Copyright (C) OpenMRS Inc. OpenMRS is a registered trademark and the OpenMRS
 * graphic logo is a trademark of OpenMRS Inc.
 */
import angularTranslate from 'angular-translate';
import angularTranslateLoaderUrl from 'angular-translate-loader-url';

export default angular
    .module('angularjs-openmrs-api-translate', ['pascalprecht.translate'])
    .provider('openmrsTranslate', openmrsTranslateProvider).name;

openmrsTranslateProvider.$inject = ['$translateProvider'];
function openmrsTranslateProvider($translateProvider) {

    function init() {
		var contextPath = getContextPath();
		
		$translateProvider.fallbackLanguage('en')
			.preferredLanguage('en')
			.useUrlLoader('/' + contextPath + '/module/uicommons/messages/messages.json',  {
                queryParameter : 'localeKey'
            })
			.useSanitizeValueStrategy('escape') // see http://angular-translate.github.io/docs/#/guide/19_security
			.forceAsyncReload(true);  // this line is what allows use to merge the list of statistically-defined locations with those loaded via URL, see https://angular-translate.github.io/docs/#/guide/12_asynchronous-loading
	}
	
	init();
	
    function addTranslations(key, newMessages) {	
        var oldMessages = $translateProvider.translations(key);
        if (!angular.isDefined(oldMessages)) {
            oldMessages = {};
        }
        $translateProvider.translations(key, angular.extend(oldMessages, newMessages))
    }

    function getContextPath() {
        if (typeof OPENMRS_CONTEXT_PATH === 'undefined') {
			return 'openmrs';
		} else {
			return OPENMRS_CONTEXT_PATH;
		}
    }

    function provideOpenmrsTranslate($translate, $http) {
        function init() {
            $http.get('/' + getContextPath() + '/ws/rest/v1/session').then(
                function(response) {
                    if (response.data['locale'] != null) {
                        $translate.use(response.data['locale']);
                    }
                }
            );
        }

        init(); 

        function changeLanguage(key) {
            $translate.use(key);
            $http.post('/' + getContextPath() + '/ws/rest/v1/session', { 'locale': key }).then(
                function(response) {
                    console.log("Locale changed to " + key);
                }
            );
        }

        return {
            changeLanguage: changeLanguage
        };
    }

    return {
        addTranslations: addTranslations,
        $get: ['$translate', '$http', provideOpenmrsTranslate]
    }
}
