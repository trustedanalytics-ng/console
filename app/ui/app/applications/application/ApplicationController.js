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

    App.controller('ApplicationController', function ($scope, $q, $stateParams, State, $state, ApplicationStateClient,
        ApplicationResource, ServiceInstancesResource, NotificationService) {

        var appId = $stateParams.appId;

        $scope.appId = appId;
        $scope.state = new State().setPending();

        $scope.tabs = {
            overview: 1,
            bindings: 2
        };
        $scope.tab = $scope.tabs.overview;

        $scope.servicesToDelete = {};

        $scope.isTabActive = function (sref) {
            return $state.is(sref);
        };

        loadApplication();

        $scope.refresh = function () {
            $scope.state.setPending();
            loadApplication();
        };

        $scope.restage = function () {
            $scope.state.setPending();
            ApplicationStateClient.restartApplication(appId)
                .then($scope.refresh);
        };

        $scope.start = function () {
            $scope.state.setPending();
            ApplicationStateClient.startApplication(appId)
                .then($scope.refresh);
        };

        $scope.stop = function () {
            $scope.state.setPending();
            ApplicationStateClient.stopApplication(appId)
                .then($scope.refresh);
        };

        $scope.delete = function () {
            NotificationService.confirm('confirm-delete-app')
                .then(function () {
                    $scope.state.setPending();
                    ApplicationResource
                        .withErrorMessage('Deleting application failed')
                        .deleteApplication(appId)
                        .then(function onSuccess() {
                            $state.go('app.applications');
                            NotificationService.success('Application deletion has been scheduled');
                        })
                        .catch(function onError() {
                            $scope.state.setLoaded();
                        });
                });
        };

        function loadApplication() {
            return $q.all([
                    ApplicationResource
                        .supressGenericError()
                        .getApplication(appId),
                    ServiceInstancesResource
                        .supressGenericError()
                        .getAll()
                ])
                .then(function(data) {
                    $scope.application = data[0];
                    $scope.instances = data[1];
                    $scope.state.setLoaded();
                })
                .catch(function onError(response) {
                    if(response.status === 404) {
                        NotificationService.error('Application with id ' + appId + ' not found');
                        $state.go('app.applications');
                    } else {
                        NotificationService.genericError(response.data, 'Failed to load application details');
                        $scope.state.setError(response.status);
                    }
                });
        }

    });
}());