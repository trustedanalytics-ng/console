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

(function() {
    'use strict';

    App.factory('ServiceInstancesListHelper', function (ServiceInstancesResource) {

        return {
            succeededInstances: succeededInstances,
            refreshContent: refreshContent
        };

        function refreshContent($scope) {
            return ServiceInstancesResource
                .withErrorMessage('Error loading service instances')
                .getAll()
                .then(function success(data) {
                    $scope.services = succeededInstances(data);
                });
        }

        function succeededInstances(data) {
            return _.groupBy(data, 'serviceName');
        }

    });
}());