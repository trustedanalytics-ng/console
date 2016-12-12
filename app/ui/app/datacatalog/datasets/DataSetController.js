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

    App.controller('DataSetController', function ($scope, DataSetResource, $stateParams, State, NotificationService,
                                                  $state, targetProvider) {
        $scope.errorMessage = '';

        var state = new State();

        $scope.state = state;

        $scope.id = $stateParams.datasetId || "";
        $scope.dataSet = {};
        $scope.isArray = angular.isArray;

        var privacySettingsState = function () {
            $scope.canModifyOrDelete = !_.isUndefined(_.findWhere($scope.organizations, {guid: $scope.dataSet.orgUUID}));
        };

        var updateDataset = function () {
            state.setPending();
            DataSetResource.getById($scope.id)
                .then(function (data) {
                    data = data || {};
                    $scope.dataSet = data._source;
                    $scope.dataSetId = data._id;

                    privacySettingsState();
                    state.value = state.values.LOADED;
                })
                .catch(function () {
                    state.value = state.values.ERROR;
                });
        };

        updateDataset();

        $scope.organizations = targetProvider.getOrganizations();

        $scope.$watchCollection('organizations', function () {
            privacySettingsState();
        });

        $scope.updateTitle = function (currentText) {
            state.setPending();
            var body = {title: currentText};
            DataSetResource
                .withErrorMessage('Failed to change dataset name')
                .update($scope.id, body)
                .finally(function onFinally() {
                    state.setLoaded();
                });
        };

        $scope.delete = function () {
            NotificationService.confirm('confirm-delete')
                .then(function () {
                    state.setPending();
                    DataSetResource
                        .withErrorMessage("Error while deleting the dataset")
                        .deleteById($scope.id)
                        .then(function onSuccess() {
                            NotificationService.success("Dataset has been deleted");
                            $state.go('app.datacatalog.datasets');
                        }).catch(function onError() {
                        state.setLoaded();
                    });
                });
        };

    });
}());

