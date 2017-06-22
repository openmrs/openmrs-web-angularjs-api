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
	var initialized = false;

    function init() {
		if (!initialized) {
			var contextPath;
			if (typeof OPENMRS_CONTEXT_PATH === 'undefined') {
				contextPath = 'openmrs';
			} else {
				contextPath = OPENMRS_CONTEXT_PATH;
			}
		
			$translateProvider.fallbackLanguage('en')
				.preferredLanguage('en')
				.useUrlLoader('/' + contextPath + '/module/uicommons/messages/messages.json')
				.useSanitizeValueStrategy('escape') // see http://angular-translate.github.io/docs/#/guide/19_security
				.forceAsyncReload(true)  // this line is what allows use to merge the list of statistically-defined locations with those loaded via URL, see https://angular-translate.github.io/docs/#/guide/12_asynchronous-loading
			initialized = true;
		}
    }

    return {
        addTranslations: addTranslations,
        $get: ['$translate', provideOpenmrsTranslate]
    }
	
    function addTranslations(key, newMessages) {
		init();
	
        var oldMessages = $translateProvider.translations(key);
        if (!angular.isDefined(oldMessages)) {
            oldMessages = {};
        }
        $translateProvider.translations(key, angular.extend(oldMessages, newMessages))
    }

    function provideOpenmrsTranslate($translate) {
        return {
            changeLanguage: changeLanguage
        };

        function changeLanguage(key) {
            $translate.use(key);
        }
    }
}
