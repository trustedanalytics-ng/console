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

    App.controller('ServicesController', function ($http, serviceExtractor, targetUrlBuilder, $scope, State,
        OfferingsResource) {

        var self = this,
            searchHandler = null,
            state = new State();

        self.state = state;

        $scope.currentPage = 1;
        $scope.itemsPerPage = 12;

        self.updateServices = function () {

            self.state.setPending();

            OfferingsResource
                .withErrorMessage('Failed to retrieve services list')
                .getAll()
                .then(function (data) {
                    data = data || {};
                    self.services = _.sortBy(serviceExtractor.extract(data), function (service) {
                        return service.name.toLowerCase();
                    });
                    self.filtered = self.services;
                    calculatePagination($scope.currentPage, $scope.itemsPerPage);
                    self.state.setLoaded();

                })
                .catch(function () {
                    self.state.setError();
                });

        };

        self.updateServices();

        $scope.$on('targetChanged', function () {
            self.updateServices();
        });

        $scope.$watch('currentPage + numPerPage', function() {
            calculatePagination($scope.currentPage, $scope.itemsPerPage);
        });

        searchHandler = $scope.$on('searchChanged', function (eventName, searchText) {
            $scope.searchText = searchText;
            self.filtered = _.filter(self.services, _.partial(isServiceMatching, $scope.searchText));

            calculatePagination($scope.currentPage, $scope.itemsPerPage);
        });

        $scope.$on('$destroy', function () {
            if (searchHandler) {
                searchHandler();
            }
        });

        function calculatePagination(currentPage, itemsPerPage) {
            $scope.begin = ((currentPage - 1) * itemsPerPage);
            $scope.end = $scope.begin + itemsPerPage;
            if(self.filtered) {
                $scope.numPages = Math.ceil(self.filtered.length / itemsPerPage);
            }
        }
    });


    function fieldMatches(searchText, value) {
        if(_.isString(value)) {
            return value.toLowerCase().indexOf(searchText) > -1;
        }
        if(_.isArray(value)) {
            return _.some(value, _.partial(fieldMatches, searchText));
        }
        return false;
    }

    function isServiceMatching(searchText, service) {
        if (!searchText) {
            return true;
        }
        return _.chain(service)
            .pick(['name', 'description', 'tags'])
            .some(_.partial(fieldMatches, searchText.toLowerCase()))
            .value();
    }
}());
