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

    App.controller('DataSetsController', function ($scope, $routeParams, ngTableParams, State,
                                                   $cookies, DataSetsHelper, ValidationPatterns) {
        var TOOL_KEY = 'datacatalog_tool',
            DEFAULT_TOOL = 'hue',
            searchText = '';

        $scope.pagination = {
            pageSize: 12,
            total: 0,
            currentPage: 1,
            pages: []
        };

        $scope.dateValidationMessage = ValidationPatterns.DATE.validationMessage;

        var category = null;
        $scope.onCategoryChange = function (c) {
            category = c;
            $scope.pagination.currentPage = 1;
            $scope.search();
        };

        $scope.format = {};
        $scope.created = {};
        $scope.tool = $cookies.get(TOOL_KEY) || DEFAULT_TOOL;
        $scope.id = $routeParams.id || "";
        $scope.dataSets = {};
        $scope.state = new State().setLoaded();

        $scope.$watch('tool', function () {
            $cookies.put(TOOL_KEY, $scope.tool);
        });

        /*jshint newcap: false*/
        function preparePagination() {
            $scope.pagination.pages = new ngTableParams().generatePagesArray($scope.pagination.currentPage,
                $scope.pagination.total, $scope.pagination.numPerPage);
        }

        $scope.availableVisualizationsTools =[];

        DataSetsHelper.loadPlatformInfo($scope.tool).then(function(data){
            $scope.availableVisualizationsTools = data.availableVisualizations;
            $scope.tool = data.tool;
        });

        $scope.isVisualizationToolAvailable = function (toolName) {
            return _.contains($scope.availableVisualizationsTools, toolName.toLowerCase());
        };

        /*jshint newcap: true*/
        $scope.search = function () {
            DataSetsHelper.search($scope, category, searchText)
                .then(function onSuccess() {
                    preparePagination();
                    $scope.state.setLoaded();
                });
        };

        $scope.$on('searchChanged', function (eventName, _searchText) {
            if(_searchText !== searchText) {
                searchText = _searchText;
                $scope.changePage(1, true);
            }
        });

        $scope.$on('targetChanged', function () {
            $scope.changePage(1, true);
        });

        $scope.$watchGroup(['created.from', 'created.to', 'format.value'], function (newValues, oldValues) {
            if (_.difference(newValues, oldValues)) {
                $scope.changePage(1, true);
            }
        });

        $scope.changePage = function (pageNo, reload) {
            if ((pageNo !== $scope.pagination.currentPage) || (reload)) {
                $scope.pagination.currentPage = pageNo;
                $scope.search();
            }
        };

        $scope.getFormatIcon = DataSetsHelper.getFormatIcon;

        $scope.openFrom = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.fromOpened = true;
        };

        $scope.openTo = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.toOpened = true;
        };
    });
}());
