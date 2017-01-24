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

    App.controller('ModelsController', function ($scope, State, $state, ModelResource, CommonTableParams,
            targetProvider, ValidationPatterns, FilterUtils) {
        var state = new State().setPending();
        var SEARCH_FIELDS = [ "name", "algorithm", "creationTool" ];
        var UNDEFINED_MODEL_TYPE = "Choose Model Type";
        var searchText = '';
        $scope.state = state;

        $scope.modelTypes = [UNDEFINED_MODEL_TYPE];
        $scope.dateValidationMessage= ValidationPatterns.DATE.validationMessage;

        var DEFAULT_FILTERS = Object.freeze({
            selectedType: UNDEFINED_MODEL_TYPE,
            created: {from : '', to: ''}
        });

        var dateFilter = function (model) {
            return isBetweenDate(model.addedOn, $scope.filters.created.from, $scope.filters.created.to);
        };

        var searchFilter = function (model) {
            return FilterUtils.somePropertiesMatch(model, SEARCH_FIELDS, searchText);
        };

        var typeFilter = function (model) {
            return $scope.filters.selectedType === UNDEFINED_MODEL_TYPE ||
                $scope.filters.selectedType === model.creationTool;
        };

        var filters = {
            search: searchFilter,
            date: dateFilter,
            type: typeFilter
        };

        $scope.clearFilters = function () {
            $scope.filters = angular.copy(DEFAULT_FILTERS);
            $scope.filters.created.from = '';
            $scope.filters.created.to = '';
            $scope.matchSelectedType($scope.filters.selectedType);
            $scope.$broadcast('resetSearch');
        };

        $scope.$on('searchChanged', function (event, _searchText) {
            searchText = _searchText;
            reload();
        });

        $scope.$on('targetChanged', getInstances);

        $scope.getModelCreationTimestamp = getModelCreationTimestamp;
        $scope.matchSelectedType = reload;

        $scope.$watch('filters.created.from', function (newValue, oldValue) {
            if(_.difference(newValue, oldValue)) {
                reload();
            }
        });

        $scope.$watch('filters.created.to', function (newValue, oldValue) {
            if(_.difference(newValue, oldValue))  {
                if ($scope.filters && $scope.filters.created.to) {
                    $scope.filters.created.to.setHours(23, 59, 59);
                }
                reload();
            }
        });

        getInstances();

        $scope.tableParams = CommonTableParams.getTableParams($scope, function () {
            return $scope.filteredModels;
        });

        function reload () {
            $scope.filteredModels = FilterUtils.filterByMany($scope.models, filters);
            $scope.tableParams.reload();
            $scope.tableParams.page(1);
        }

        function getInstances() {
            $scope.state.setPending();
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
    });

    function getModelCreationTimestamp(model) {
        return moment(model.addedOn).unix() * 1000;
    }

    function isBetweenDate(givenDate, startDate, endDate) {
        var startMoment = startDate ? moment(startDate) : moment(0);
        var endMoment = endDate ? moment(endDate) : moment().add(1000, 'years');

        return moment(givenDate).isBetween(startMoment, endMoment);
    }
}());