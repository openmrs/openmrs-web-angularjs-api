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
import messagesEn from 'json-loader!./messages/messages_en.json'
import messagesEs from 'json-loader!./messages/messages_es.json'


export default angular
    .module('angularjs-openmrs-api-translate', ['pascalprecht.translate'])
    .provider('openmrsTranslate', openmrsTranslateProvider)
    .config(['openmrsTranslateProvider', translateConfig]).name;

function translateConfig(openmrsTranslateProvider) {
    openmrsTranslateProvider.addTranslations('en', messagesEn);
    openmrsTranslateProvider.addTranslations('es', messagesEs);
}

openmrsTranslateProvider.$inject = ['$translateProvider'];
function openmrsTranslateProvider($translateProvider) {
    function init() {
        $translateProvider.fallbackLanguage('en');
        $translateProvider.preferredLanguage('en');
    }

    init();

    return {
        addTranslations: addTranslations,
        $get: ['$translate', provideOpenmrsTranslate]
    }

    function addTranslations(key, newMessages) {
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
