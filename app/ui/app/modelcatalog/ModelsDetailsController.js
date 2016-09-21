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

    App.controller('ModelsDetailsController', function ($scope, State, ModelResource,
                                                       NotificationService, $stateParams, $state) {
        var modelId = $stateParams.modelId;
        var MODEL_NOT_FOUND_ERROR = 404;
        var state = new State().setPending();
        $scope.state = state;
        $scope.deleteState = new State().setDefault();

        ModelResource.getModelMetadata(modelId)
            .then(function (model) {
                $scope.model = model;
                $scope.state.setLoaded();
            })
            .catch(function onError(error) {
                if (error.status === MODEL_NOT_FOUND_ERROR) {
                    $state.go('app.modelcatalog.models');
                    NotificationService.error(error.data.message  || 'Model not found');
                } else {
                    $scope.state.setError();
                    NotificationService.error(error.data.message || 'An error occurred while loading model details page');
                }
            });

        $scope.tryDeleteModel = function () {
            NotificationService.confirm('confirm-delete', {model: $scope.model.name})
                .then(function () {
                    $scope.deleteModel();
                });
        };

        $scope.deleteModel = function () {
            $scope.deleteState.setPending();
            ModelResource
                .withErrorMessage('Error occurred while deleting a model.')
                .deleteModel(modelId)
                .then(function () {
                    NotificationService.success('Model has been deleted');
                    $state.go('app.modelcatalog.models');
                })
                .finally(function () {
                    $scope.deleteState.setDefault();
                });
        };
    });
}());
