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
    'use strict';

    App.controller('ServiceInstanceDetailsController', function ($scope, State, ServiceInstancesResource,
            NotificationService, ServiceMetadataFetcher, $stateParams, $state) {
        var instanceId = $stateParams.instanceId;
        var INSTANCE_NOT_FOUND_ERROR = 404;
        var state = new State().setPending();
        var toolsState = new State().setPending();
        $scope.state = state;
        $scope.toolsState = toolsState;
        $scope.deleteState = new State().setDefault();

        $scope.getLogin = ServiceMetadataFetcher.getLogin;
        $scope.getPassword = ServiceMetadataFetcher.getPassword;
        $scope.getUrl = ServiceMetadataFetcher.getUrl;
        
        $scope.reload = function () {
            $scope.state.setPending();
            ServiceInstancesResource.getById(instanceId)
                .then(function (serviceInstance) {
                    fillTimestamps(serviceInstance);
                    $scope.serviceInstance = serviceInstance;
                    $scope.state.setLoaded();
                })
                .catch(function onError (error) {
                    if (error.status === INSTANCE_NOT_FOUND_ERROR) {
                        $state.go('app.marketplace.instances');
                    } else {
                        $scope.state.setError();
                        NotificationService.error(error.data.message || 'An error occurred while loading service instance page');
                    }
                });
        };
        $scope.reload();

        $scope.deleteWithConfirmation = function () {
            NotificationService
                .confirm('confirm-delete', {instance: $scope.serviceInstance.name})
                .then($scope.delete);
        };

        $scope.delete = function () {
            $scope.deleteState.setPending();
            ServiceInstancesResource
                .deleteInstance(instanceId)
                .then(function () {
                    NotificationService.success('Instance deletion has been scheduled');
                    $state.go('app.marketplace.instances');
                })
                .finally(function () {
                    $scope.deleteState.setDefault();
                });
        };

        $scope.restart = function () {
            $scope.state.setPending();
            ServiceInstancesResource
                .restartInstance(instanceId)
                .then(function() {
                    NotificationService.success('Instance restart has been scheduled');
                    $scope.reload();
                });
        };

        $scope.start = function () {
            $scope.state.setPending();
            ServiceInstancesResource
                .startInstance(instanceId)
                .then(function() {
                    NotificationService.success('Instance start has been scheduled');
                    $scope.reload();
                });
        };

        $scope.stop = function () {
            $scope.state.setPending();
            ServiceInstancesResource
                .stopInstance(instanceId)
                .then(function() {
                    NotificationService.success('Instance stop has been scheduled');
                    $scope.reload();
                });
        };
    });

    function fillTimestamps(instance) {
        if(!instance.auditTrail) {
            return;
        }
        instance.auditTrail.createdOnMilisec = instance.auditTrail.createdOn * 1000;
    }
}());
