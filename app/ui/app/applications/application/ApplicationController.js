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

    App.controller('ApplicationController', function ($scope, $stateParams, State, $state, ApplicationHelper) {

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
            ApplicationHelper.restartApplication(appId)
                .then($scope.refresh);
        };

        $scope.start = function () {
            $scope.state.setPending();
            ApplicationHelper.startApplication(appId)
                .then($scope.refresh);
        };

        $scope.stop = function () {
            $scope.state.setPending();
            ApplicationHelper.stopApplication(appId)
                .then($scope.refresh);
        };

        $scope.delete = function () {
            ApplicationHelper.deleteApplication($scope.state, appId);
        };

        function loadApplication() {

            ApplicationHelper.getApplication(appId)
                .then(function(data) {
                    $scope.instances = data.instances;
                    $scope.application = data.application;
                    $scope.state.setLoaded();
                })
                .catch(function onError(response) {
                    $scope.state.setError(response.status);
                });
        }

    });
}());