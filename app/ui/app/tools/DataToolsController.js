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

    App.controller('DataToolsController', function ($scope, $http, $q, targetProvider, AtkInstanceResource, State,
        NotificationService, serviceExtractor, ServiceResource, ServiceInstancesResource) {

        var GATEWAY_TIMEOUT_ERROR = 504;
        var state = new State().setPending();
        var clientState = new State().setPending();
        var deleteState = new State().setLoaded();
        var newInstanceState = new State().setDefault();
        $scope.state = state;
        $scope.clientState = clientState;
        $scope.deleteState = deleteState;
        $scope.newInstanceState = newInstanceState;

        var org = targetProvider.getOrganization();
        var space = targetProvider.getSpace();
        $scope.organization = org;

        $scope.$on('targetChanged', function () {
            org = targetProvider.getOrganization();
            initializeInstances($scope, org, AtkInstanceResource, NotificationService);
        });

        initializeInstances($scope, org, AtkInstanceResource, NotificationService);

        $scope.createInstance = function (name) {
            $scope.newInstanceState.setPending();
            ServiceInstancesResource
                .supressGenericError()
                .createInstance(
                    name,
                    $scope.servicePlanGuid,
                    targetProvider.getOrganization().guid
                )
                .then(function onSuccess() {
                    $scope.newInstanceState.setDefault();
                    notifySuccessInstanceCreation(NotificationService);
                    $scope.state.setPending();
                    getAtkInstances($scope, targetProvider.getOrganization(), AtkInstanceResource);
                })
                .catch(function(error) {
                    if(error.status === GATEWAY_TIMEOUT_ERROR) {
                        notifySuccessInstanceCreation(NotificationService);
                    } else {
                        NotificationService.genericError(error.data, 'Error creating new service instance');
                    }
                })
                .finally(function () {
                    $scope.state.setLoaded();
                    $scope.newInstanceState.setDefault();
                });
            $scope.newInstanceName = null;
        };

        $scope.deleteInstance = function (instanceName, instanceGuid, serviceGuid) {
            NotificationService.confirm('confirm-delete', {instanceToDelete: instanceName})
                .then(function () {
                    $scope.state.setPending();
                    $scope.deleteState.setPending();
                    ServiceInstancesResource
                        .withErrorMessage('Error while deleting a service instance')
                        .deleteInstance(serviceGuid)
                        .then(function() {
                            NotificationService.success('Application has been deleted');
                            return getAtkInstances($scope, targetProvider.getOrganization(), AtkInstanceResource);
                        })
                        .finally(function() {
                            $scope.state.setLoaded();
                            $scope.deleteState.setDefault();
                        });
                });
        };
    });

    function initializeInstances($scope, org, AtkInstanceResource, NotificationService) {
        $scope.state.setPending();
        getAtkInstances($scope, org, AtkInstanceResource)
            .then(function () {
                if (!$scope.instances) {
                    var defaultInstanceName = "atk-" + org.name;
                    confirmCreatingImmediateInstance($scope, NotificationService, defaultInstanceName);
                }
                $scope.state.setLoaded();
            });
    }

    function getAtkInstances($scope, org, AtkInstanceResource) {
        $scope.state.setPending();
        $scope.deleteState.setDefault();
        return AtkInstanceResource.getAll(org.guid)
            .then(function onSuccess(response) {
                $scope.instances = response.instances;
                $scope.servicePlanGuid = response.service_plan_guid;
            });
    }

    function confirmCreatingImmediateInstance($scope, NotificationService, defaultInstanceName) {
        NotificationService.confirm('confirm-creating-instance', {instanceToCreate: defaultInstanceName})
            .then(function (instanceToCreate) {
                $scope.createInstance(instanceToCreate[0]);
            });
    }

    function notifySuccessInstanceCreation(notificationService) {
        notificationService.success("Creating an TAP Analytics Toolkit instance may take a while. You can try to " +
        "refresh the page after in a minute or two.", "Task scheduled");
    }
}());
