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
    'use strict';

    App.controller('ApplicationRegisterController', function ($scope, State, ApplicationMarketplaceRegistrator) {

        $scope.state = new State().setLoaded();
        $scope.offeringsState = new State().setLoaded();
        $scope.offerings = [];
        $scope.offeringRequest = {
            applicationId: $scope.appId,
            tags: []
        };

        $scope.submitRegister = submitRegister;
        $scope.addTag = addTag;

        refreshOfferings();


        function submitRegister() {
            $scope.state.setPending();

            ApplicationMarketplaceRegistrator.registerApplication($scope.offeringRequest)
                .then(function () {
                    refreshOfferings();
                })
                .finally(function () {
                    $scope.state.setLoaded();
                });
        }

        function refreshOfferings() {
            $scope.offeringsState.setPending();

            ApplicationMarketplaceRegistrator.getOfferingsOfApplication($scope.appId)
                .then(function (offerings) {
                    $scope.offerings = offerings;
                })
                .finally(function () {
                    $scope.offeringsState.setLoaded();
                });
        }

        function addTag(tag) {
            tag = tag && tag.trim();
            if(tag) {
                $scope.offeringRequest.tags.push(tag);
            }
        }
    });

})();