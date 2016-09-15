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

    App.controller('ServiceInstancesListController', function ($scope, State, targetProvider, ServiceInstancesResource,
        ServiceKeysResource, NotificationService, jsonFilter, blobFilter, KubernetesServicesResource, ServiceInstancesMapper, ServiceInstancesListHelper, UserProvider) {

        var state = new State().setPending();
        $scope.state = state;

        refreshContent();

        UserProvider.isAdmin().then(function (isAdmin) {
            $scope.admin = isAdmin;
        });

        $scope.$on('targetChanged', function () {
            refreshContent();
        });

        /*$scope.exposeInstance = function(instance, visibility) {
            state.setPending();
            ServiceInstancesListHelper
                .exposeInstance(instance.guid, visibility)
                .then(function () {
                    refreshContent();
                })
                .catch(function() {
                    state.setLoaded();
                });
        };*/

        function refreshContent() {
            state.setPending();
            ServiceInstancesListHelper
                .refreshContent($scope)
                .finally(function () {
                    state.setLoaded();
                });
        }
    });
}());
