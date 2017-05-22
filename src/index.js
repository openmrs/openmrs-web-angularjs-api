import angular from 'angular';
import openmrsRest from './openmrs-rest';
import openmrsTranslate from './openmrs-translate';

export default angular.module('angularjs-openmrs-api', [openmrsRest, openmrsTranslate]).name;