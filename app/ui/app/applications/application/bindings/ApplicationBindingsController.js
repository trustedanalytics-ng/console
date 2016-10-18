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

    App.controller('ApplicationBindingsController', function ($scope, ApplicationResource,
            State, $stateParams, NotificationService) {

            var appId = $stateParams.appId;

            var state = new State().setPending();
            $scope.state = state;
            $scope.appId = appId;

            $scope.loadBindings = function () {
                loadBindings($scope, ApplicationResource);
            };

            $scope.setApplication = function (application) {
                $scope.application = application;
                updateInstances($scope);
            };

            $scope.$watch('$parent.application', function (application) {
                $scope.setApplication(application);
            });

            $scope.setInstances = function (instances) {
                $scope.services = instances;
                updateInstances($scope);
            };

            $scope.$watch('$parent.instances', function (instances) {
                $scope.setInstances(instances);
            });

            $scope.bindService = function (service) {
                if (!$scope.application) {
                    return;
                }
                state.value = state.values.PENDING;
                ApplicationResource
                    .withErrorMessage('Failed to bind the service')
                    .bindService($scope.appId, service.id)
                    .then(function () {
                        NotificationService.success('Service has been bound');
                    })
                    .finally(function () {
                        $scope.loadBindings();
                    });
            };

            $scope.unbindService = function (service) {
                if (!$scope.application) {
                    return;
                }
                state.setPending();
                ApplicationResource
                    .withErrorMessage('Failed to unbind service')
                    .unbindService($scope.appId, service.id)
                    .then(function () {
                        NotificationService.success('Service has been unbound');
                    })
                    .finally(function () {
                        $scope.loadBindings();
                    });
            };

            $scope.loadBindings();
        }
    );

    function updateInstances($scope) {
        if (!$scope.application || !$scope.services || !$scope.bindings) {
            return;
        }

        var bounderServiceIds = _.map($scope.bindings, function(binding) {
            return binding.entity.service_instance_guid;
        });
        $scope.servicesBound = $scope.services.filter(function (s) {
            return _.contains(bounderServiceIds, s.id);
        });
        $scope.servicesAvailable = _.difference($scope.services, $scope.servicesBound);

        $scope.state.value = $scope.state.values.LOADED;
    }

    function loadBindings($scope, ApplicationResource) {
        return ApplicationResource.getBindings($scope.appId)
            .then(function onSuccess(bindings) {
                $scope.bindings = bindings;
                updateInstances($scope);
            })
            .catch(function onError() {
                $scope.state.setError();
            });
    }
}());
