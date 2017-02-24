/**
 * Copyright (c) 2016 Intel Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function () {
    "use strict";

    var INSTANCE_OK_STATE = 'RUNNING';
    var METADATA_SETTINGS_KEY = 'VCAP';

    App.controller('ToolsInstancesListController', function ($scope, $location, targetProvider, State,
        NotificationService, OfferingsResource, ServiceInstancesResource, $state, ValidationPatterns, ServiceMetadataFetcher) {

        var GEARPUMP_LINK_SUFFIX = '/';

        $scope.validationPattern = ValidationPatterns.INSTANCE_NAME.pattern;
        $scope.validationMessage = ValidationPatterns.INSTANCE_NAME.validationMessage;

        $scope.gearpumpLinkSuffix = GEARPUMP_LINK_SUFFIX;

        $scope.servicePlanGuid = "";
        var state = new State().setPending();
        $scope.state = state;

        var SERVICE_LABEL = $location.path().split('/').pop();
        $scope.instanceType = SERVICE_LABEL;
        $scope.brokerName = $state.current.entityDisplayName;
        $scope.organization = targetProvider.getOrganization();

        $scope.$on('targetChanged', refreshInstances);

        refreshInstances();
        getOffering($scope, OfferingsResource, SERVICE_LABEL);

        function refreshInstances() {
            state.setPending();
            getInstances($scope, ServiceInstancesResource, SERVICE_LABEL)
                .then(function() {
                    state.setLoaded();
                })
                .catch(function() {
                    state.setError();
                });
        }

        $scope.createInstance = function (name) {
            $scope.state.setPending();
            var offeringId = $scope.offering.id;
            var planId = $scope.offering.offeringPlans[0].id;
            ServiceInstancesResource
                .createInstance(offeringId, name, planId)
                .then(function () {
                    NotificationService.success('Creating an ' + $scope.brokerName +
                        ' instance may take a while. You can try to refresh the page after few seconds.');
                })
                .finally(function () {
                    refreshInstances();
                    $scope.newInstanceName = "";
                });
        };

        $scope.hasLogin = function (instances) {
            return _.some(instances, $scope.getLogin);
        };

        $scope.getLogin = ServiceMetadataFetcher.getLogin;
        $scope.getPassword = ServiceMetadataFetcher.getPassword;
        $scope.getUrl = ServiceMetadataFetcher.getUrl;
    });


    function getInstances($scope, ServiceInstancesResource, offeringName) {
        return ServiceInstancesResource
            .withErrorMessage('Failed to load instances')
            .getAll()
            .then(function (response) {
                $scope.instances = _.filter(response, {serviceName: offeringName});
                $scope.loginAvailable = loginAvailable($scope.instances, $scope.getLogin);
                $scope.passwordAvailable = passwordAvailable($scope.instances, $scope.getPassword);

                _.each($scope.instances, function (instance) {
                    if(instance.state === INSTANCE_OK_STATE) {
                        instance.uiUrl = extractUiUrlFromMetadata(instance.metadata);
                    }
                });
            });
    }

    function extractUiUrlFromMetadata(metadata) {
        var vcap = angular.fromJson(_.findWhere(metadata, {key: METADATA_SETTINGS_KEY}));
        if(vcap && vcap.value) {
            var credentials = angular.fromJson(vcap.value).credentials;
            return credentials ? credentials.dashboardUrl : null;
        }
        return null;
    }

    function getOffering($scope, OfferingsResource, offeringName) {
        return OfferingsResource
            .withErrorMessage('Failed to load offering')
            .getAll()
            .then(function(offerings) {
                $scope.offering = _.find(offerings, function(offering) {
                    return offering.name === offeringName;
                });
            });
    }

    function loginAvailable(instances, login) {
        return _.some(instances, login);
    }

    function passwordAvailable(instances, password) {
        return _.some(instances, password);
    }

}());
