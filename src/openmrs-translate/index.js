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
import openmrsRest from '../openmrs-rest';

export default angular
    .module('angularjs-openmrs-api-translate', ['pascalprecht.translate', openmrsRest])
    .factory('openmrsTranslateLoader', openmrsTranslateLoader)
    .filter('translateAs', openmrsTranslateAs)
    .provider('openmrsTranslate', openmrsTranslateProvider).name;

/**
 * Loads translations from a file using translateUrlLoader. It fetches server url from openmrsRest.
 */
openmrsTranslateLoader.$inject = ['$translateUrlLoader', 'openmrsRest']; 
function openmrsTranslateLoader($translateUrlLoader, openmrsRest) {
    return function (options) {
        return openmrsRest.getServerUrl().then(
            function(serverUrl) {
                options.url = serverUrl + '/module/uicommons/messages/messages.json';
                options.queryParameter = 'localeKey';
                return $translateUrlLoader(options);
            }
        );
    };
}

openmrsTranslateAs.$inject['openmrsTranslate']
function openmrsTranslateAs(openmrsTranslate) {
    return function(input, type, name) {
        return openmrsTranslate.translateAs(input, type, name)
    }
}

openmrsTranslateProvider.$inject = ['$translateProvider'];
function openmrsTranslateProvider($translateProvider) {

    function init() {		
		$translateProvider.fallbackLanguage('en')
            .preferredLanguage('en')
			.useLoader('openmrsTranslateLoader')
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

    function provideOpenmrsTranslate($translate, $http, $q,  $filter, openmrsRest) {
        var language;

        function init() {
            getLanguage();
        }

        init(); 

        function setLanguage(key) {
            $translate.use(key);
            //using create and not update since session is a singleton without a uuid
            openmrsRest.create('session', { 'locale': key }).then(function() {
                console.log("Locale changed to " + key);
            });
        }
        
        function getLanguage() {
            var deferred = $q.defer();
            if (angular.isDefined(language)) {
                deferred.resolve(language);
            } else {
                openmrsRest.get('session').then(
                    function(response) {
                        if (response['locale'] != null) {
                            //TODO: Mark reported in dd85b9060d9c28cd075c2586509e1195687e8a2f
                            //that Locale is serialized differently on his system.
                            //We need to support both cases until we clarify why.
                            if (response['locale']['language'] != null) {
                                language = response['locale']['language'];
                            } else {
                                language = response['locale'];
                            }
                            $translate.use(language);
                        } else {
                            language = $translate.use();
                        }
                        deferred.resolve(language);
                    },
                    function(error) {
                        language = $translate.use();
                        deferred.resolve(language);
                    }
                );
            }
            return deferred.promise;
        }

        /*  Used to localize metadata based on our standard format for setting messages properties for metadata, ie:
         *  ui.i18n.EncounterType.name.5C16E1D6-8E73-47E4-A861-D6AAC03E2224=Disposition
         *  Standard use cases would be:
         *  translateAs(encounterType, 'encounterType')
         *  or
         *  {{ encounterType | translateAs['encounterType'] }}
         *  You can also specify the field if it's something other than name.  We use this now for RelationshipTypes
         *  which have two names (depending on the direction of the relationship):
         *  {{ relationshipType | translateAs['relationshipType', 'aIstoB'] }}
         */
        function translateAs(input, type, field) {

            if (!field) {
                field = 'name';
            }
            // first try to see if we have a custom translation property code
            if (input.uuid) {
                var code = "ui.i18n." + type + "." + field + "." + input.uuid;
                var result = $filter('translate')(code);
                if (result && result != code) {
                    return result;
                }
            }
            if (input.display) {
                return input.display;
            }
            if (input[field]) {
                return input[field];
            }
            if (input.name) {
                return input.name;
            }
            return "";
        }

        return {
            changeLanguage: setLanguage,
            setLanguage: setLanguage,
            getLanguage: getLanguage,
            translateAs: translateAs
        };
    }

    return {
        addTranslations: addTranslations,
        $get: ['$translate', '$http', '$q', '$filter', 'openmrsRest', provideOpenmrsTranslate]
    }
}
