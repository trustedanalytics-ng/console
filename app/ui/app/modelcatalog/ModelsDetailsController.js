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

    App.controller('ModelsDetailsController', function ($scope, State, ModelResource, NotificationService,
            ScoringEngineRetriever, $stateParams, $state, ModelMetadataClient) {

        var modelId = $stateParams.modelId;
        var MODEL_NOT_FOUND_ERROR = 404;
        var state = new State().setPending();

        $scope.mainArtifact = null;
        $scope.scoringEngineInstances = [];
        $scope.state = state;
        $scope.deleteState = new State().setDefault();
        $scope.scoringEngineState = new State().setPending();
        $scope.path = "";

        getModelMetadata();
        getScoringEngineInstancesFromThatModel();

        $scope.updateModelName = function (currentText) {
            if (currentText !== $scope.model.name) {
                finallyLoaded(
                    ModelMetadataClient.updateName($scope.model.id, currentText),
                    state
                );
            }
        };

        $scope.tryDeleteModel = function () {
            NotificationService.confirm('confirm-delete', {model: $scope.model.name})
                .then(deleteModel);
        };

        $scope.refresh = function () {
            getScoringEngineInstancesFromThatModel();
        };

        function deleteModel () {
            finallyDefault(
                ModelMetadataClient.deleteModel(modelId)
                    .then(function () {
                        $state.go('app.modelcatalog.models');
                    }),
                $scope.deleteState
            );
        }

        function getModelMetadata() {
            return ModelResource.getModelMetadata(modelId)
                .then(function (model) {
                    $scope.model = model;
                    setMainArtifact();
                    state.setLoaded();
                })
                .catch(function onError(error) {
                    if (error.status === MODEL_NOT_FOUND_ERROR) {
                        $state.go('app.modelcatalog.models');
                        NotificationService.error(error.data.message || 'Model not found');
                    } else {
                        $scope.state.setError();
                        NotificationService.error(error.data.message || 'An error occurred while loading model details page');
                    }
                });
        }

        function getScoringEngineInstancesFromThatModel() {
            finallyLoadedOrError(
                ScoringEngineRetriever.getScoringEngineInstancesCreatedFromThatModel(modelId)
                    .then(function (scoringEngines) {
                        $scope.scoringEngineInstances = scoringEngines;
                    }),
                $scope.scoringEngineState
            );
        }

        function setMainArtifact() {
            $scope.mainArtifact = _.find($scope.model.artifacts, ScoringEngineRetriever.getPublishAction) ||
                _.first($scope.model.artifacts);
        }

        $scope.addScoringEngine = function () {
            if (!$scope.supportsScoringEngines()) {
                NotificationService.error("Cannot create a scoring engine from selected artifact");
                return;
            }

            return finallyLoaded(
                ScoringEngineRetriever
                    .createScoringEngine($scope.model.id, $scope.model.name, $scope.mainArtifact)
                    .then(function onSuccess() {
                        $scope.refresh();
                    }),
                state);
        };

        $scope.supportsScoringEngines = function () {
            return ScoringEngineRetriever.getPublishAction($scope.mainArtifact);
        };
    });

    function finallyLoaded(promise, state) {
        state.setPending();
        return promise.finally(function() {
            state.setLoaded();
        });
    }

    function finallyDefault(promise, state) {
        state.setPending();
        return promise.finally(function() {
            state.setDefault();
        });
    }

    function finallyLoadedOrError(promise, state) {
        state.setPending();
        return promise.then(function() {
                state.setLoaded();
            })
            .catch(function() {
                state.setError();
            });
    }
}());
