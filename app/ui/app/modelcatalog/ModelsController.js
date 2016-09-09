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

    App.controller('ModelsController', function ($scope, State, ModelResource, CommonTableParams, targetProvider) {
        var state = new State().setPending();
        var searchFields = [ "name", "algorithm", "type" ];
        $scope.state = state;

        $scope.$on('searchChanged', function (event, searchText) {
            $scope.filteredModels = _.filter($scope.models, function (model) {
                return isModelMatching(model, searchText);
            });
            $scope.tableParams.reload();
            $scope.tableParams.page(1);
        });

        $scope.$on('targetChanged', function () {
            $scope.state.setPending();
            getInstances();
        });

        function getInstances() {
            ModelResource.getModels(targetProvider.getOrganization().guid)
                .then(function (models) {
                    $scope.models = models;
                    $scope.filteredModels = $scope.models;
                    $scope.state = state.setLoaded();
                }).catch(function onError() {
                    state.setError();
                });
        }
        getInstances();

        $scope.tableParams = CommonTableParams.getTableParams($scope, function () {
            return $scope.filteredModels;
        });

        function isModelMatching(model, searchText) {
            return !searchText || _.some(searchFields, function (field) {
                    return contains(model[field], searchText);
                });
        }

        function contains(str, searchText) {
            return str.toLowerCase().indexOf(searchText) > -1;
        }

    });
}());