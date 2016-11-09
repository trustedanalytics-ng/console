/**
 * Copyright (c) 2015 Intel Corporation
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

    App.controller('ToolsInstancesListController', function ($scope, $location, targetProvider, State,
        NotificationService, OfferingsResource, ServiceInstancesResource, $state, ValidationPatterns) {

        var GATEWAY_TIMEOUT_ERROR = 504;

        $scope.validationPattern = ValidationPatterns.INSTANCE_NAME.pattern;
        $scope.validationMessage = ValidationPatterns.INSTANCE_NAME.validationMessage;

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
            var offeringId = $scope.offering.metadata.guid;
            var planId = $scope.offering.entity.service_plans[0].metadata.guid;
            ServiceInstancesResource
                .supressGenericError()
                .createInstance(offeringId, name, planId)
                .then(function () {
                    NotificationService.success('Creating an ' + $scope.brokerName +
                        ' instance may take a while. You can try to refresh the page after few seconds.');
                })
                .catch(function (error) {
                    if (error.status === GATEWAY_TIMEOUT_ERROR) {
                        NotificationService.success("Creating an instance may take a while. Please refresh the page after a minute or two.", "Task scheduled");
                    }
                    else {
                        NotificationService.genericError(error.data, 'Failed to create the instance of ' + $scope.brokerName);
                    }
                })
                .finally(function () {
                    refreshInstances();
                    $scope.newInstanceName = "";
                });
        };

        $scope.deleteInstance = function (appId) {
            NotificationService.confirm('confirm-delete')
                .then(function () {
                    $scope.state.setPending();
                    return ServiceInstancesResource
                        .withErrorMessage('Deleting instance of ' + $scope.brokerName + ' failed')
                        .deleteInstance(appId);
                })
                .then(function onSuccess() {
                    NotificationService.success('Deleting instance of ' + $scope.brokerName +
                        ' may take a while. You can try to refresh the page after few seconds.');
                })
                .finally(function () {
                    refreshInstances();
                });
        };

        $scope.hasLogin = function (instances) {
            return _.some(instances, $scope.getLogin);
        };

        $scope.getLogin = getLogin;
        $scope.getPassword = getPassword;
        $scope.getUrl = getUrl;
    });


    function getInstances($scope, ServiceInstancesResource, offeringName) {
        return ServiceInstancesResource
            .withErrorMessage('Failed to load instances')
            .getAll()
            .then(function (response) {
                $scope.instances = _.filter(response, {serviceName: offeringName});
                $scope.loginAvailable = loginAvailable($scope.instances);
                $scope.passwordAvailable = passwordAvailable($scope.instances);
            });
    }

    function getOffering($scope, OfferingsResource, offeringName) {
        return OfferingsResource
            .withErrorMessage('Failed to load offering')
            .getAll()
            .then(function(offerings) {
                $scope.offering = _.find(offerings, function(offering) {
                    return offering.entity.label === offeringName;
                });
            });
    }

    function getLogin(instance) {
        return getMetadataValue(instance, ["username", "login"]);
    }

    function getPassword(instance) {
        return getMetadataValue(instance, ["password"]);
    }

    function getUrl(instance) {
        var urls = getMetadataValue(instance, ["urls"]);
        return _.isArray(urls) ? urls[0] : urls;
    }

    function loginAvailable(instances) {
        return _.some(instances, getLogin);
    }

    function passwordAvailable(instances) {
        return _.some(instances, getPassword);
    }

    function getMetadataValue(instance, listOfPossibleKeys) {
        var metaObject = _.find(instance.metadata, function(meta) {
            return _.isString(meta.key) && _.contains(listOfPossibleKeys, meta.key.toLowerCase());
        }) || {};
        return metaObject.value;
    }

}());
