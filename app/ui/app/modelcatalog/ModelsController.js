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
        var searchFields = [ "name", "algorithm", "creationTool" ];
        var searchText = '';
        $scope.state = state;
        $scope.created = {};
        $scope.dp = {
            createdOpened: false,
            toOpened: false
        };

        $scope.modelTypes = [ "Choose Model Type" ];

        var defaultFilters = {
            selectedType: $scope.modelTypes[0],
            created: {}
        };

        var dateFilter = function (model) {
            return isBetweenDate(model.addedOn, $scope.filters.created.from, $scope.filters.created.to);
        };

        var searchFilter = function (model) {
            return isModelMatching(model, searchText);
        };

        var typeFilter = function (model) {
            if ($scope.filters.selectedType === $scope.modelTypes[0]) {
                return true;
            }
            return model.creationTool === $scope.filters.selectedType;
        };

        var filters = {
            search: searchFilter,
            date: dateFilter,
            type: typeFilter
        };

        $scope.clearFilters = function () {
            $scope.filters = angular.copy(defaultFilters);
            $scope.matchSelectedType($scope.filters.selectedType);
            $scope.$broadcast('resetSearch');
        };

        $scope.$on('searchChanged', function (event, _searchText) {
            searchText = _searchText;
            reload();
        });

        $scope.$on('targetChanged', function () {
            $scope.state.setPending();
            getInstances();
        });

        $scope.matchSelectedType = function () {
            reload();
        };

        $scope.$watch('filters.created.from', function (newValue, oldValue) {
            if(_.difference(newValue, oldValue)) {
                reload();
            }
        });

        $scope.$watch('filters.created.to', function (newValue, oldValue) {
            if(_.difference(newValue, oldValue))  {
                if ($scope.filters.created.to) {
                    $scope.filters.created.to.setHours(23, 59, 59);
                }
                reload();
            }
        });

        $scope.openCreated = function () {
            $scope.dp.createdOpened = true;
        };

        $scope.openTo = function () {
            $scope.dp.toOpened = true;
        };

        $scope.getModelCreationTimestamp = function (model) {
            return moment(model.addedOn).unix() * 1000;
        };

        getInstances();

        $scope.tableParams = CommonTableParams.getTableParams($scope, function () {
            return $scope.filteredModels;
        });

        function reload () {
            $scope.filteredModels = filterModels();
            $scope.tableParams.reload();
            $scope.tableParams.page(1);
        }

        function isBetweenDate(givenDate, startDate, endDate) {
            var startMoment = startDate ? moment(startDate) : moment(0);
            var endMoment = endDate ? moment(endDate) : moment().add(1000, 'years');

            return moment(givenDate).isBetween(startMoment, endMoment);
        }

        function getInstances() {
            ModelResource.getModels(targetProvider.getOrganization().guid)
                .then(function (models) {
                    $scope.models = models;
                    $scope.modelTypes = _.union($scope.modelTypes, _.uniq(_.pluck(models, 'creationTool')));
                    $scope.filteredModels = $scope.models;
                    $scope.clearFilters();
                    $scope.state = state.setLoaded();
                }).catch(function onError() {
                    state.setError();
                });
        }

        function isModelMatching(model, searchText) {
            return !searchText || _.some(searchFields, function (field) {
                    return contains(model[field], searchText);
                });
        }

        function contains(str, searchText) {
            return str.toLowerCase().indexOf(searchText) > -1;
        }
        
        function filterModels () {
            return _.reduce(filters, function (memo, filterMethod) {
                return _.filter(memo, filterMethod);
            }, $scope.models);
        }
    });
}());