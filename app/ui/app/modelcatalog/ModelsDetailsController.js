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
                                                        ScoringEngineRetriever, $stateParams, $state, CommonTableParams,
                                                        ModelCatalogArtifactsClient, ScoringEngineResource) {
        var modelId = $stateParams.modelId;
        var MODEL_NOT_FOUND_ERROR = 404;
        var file = null;
        var MAIN_ARTIFACT_PREFIX = 'publish_';
        var state = new State().setPending();

        $scope.mainArtifact = null;
        $scope.extraArtifacts = [];
        $scope.scoringEngineInstances = [];
        $scope.state = state;
        $scope.deleteState = new State().setDefault();
        $scope.scoringEngineState = new State().setPending();
        $scope.deleteArtifactState = new State().setDefault();
        $scope.addArtifactState = new State().setDefault();
        $scope.path = "";

        //$scope.goToEditMode = function () {
        //    $state.go('app.modelcatalog.edit', {modelId: modelId, model: $scope.model});
        //};

        getModelMetadata();
        getScoringEngineInstancesFromThatModel();

        $scope.updateModelName = function (currentText) {
            if (currentText === $scope.model.name) {
                return;
            }

            $scope.state.setPending();
            var body = {name: currentText};
            ModelResource
                .withErrorMessage("Failed to change model name")
                .updateModelMetadata($scope.model.id, body)
                .then(function () {
                    NotificationService.success("Model Name has been updated");
                })
                .finally(function onFinally() {
                    $scope.state.setLoaded();
                });
        };

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

        $scope.tryDeleteArtifact = function (artifact) {
            NotificationService.confirm('confirm-delete', {artifact: artifact.filename})
                .then(function () {
                    ModelCatalogArtifactsClient.deleteArtifact(modelId, artifact.id, $scope.deleteArtifactState, getModelMetadata);
                });
        };

        $scope.tryUploadArtifact = function () {
            NotificationService.confirm('confirm-add-artifact', {scope: $scope})
                .then(function () {
                    uploadArtifact();
                });
        };

        $scope.setChosenFile = function (_file) {
            file = _file;
        };

        $scope.refresh = function () {
            getScoringEngineInstancesFromThatModel();
        };

        function uploadArtifact() {
            ModelCatalogArtifactsClient.uploadArtifact(modelId, file, $scope.addArtifactState, getModelMetadata);
        }

        function getModelMetadata() {
            ModelResource.getModelMetadata(modelId)
                .then(function (model) {
                    $scope.model = model;
                    $scope.mainArtifact = _.find($scope.model.artifacts, getPublishAction);
                    $scope.extraArtifacts = _.reject($scope.model.artifacts, getPublishAction);
                    $scope.tableParams = CommonTableParams.getTableParams($scope, function () {
                        return $scope.extraArtifacts || [];
                    });
                    $scope.state.setLoaded();
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
            $scope.scoringEngineState.setPending();
            ScoringEngineRetriever.getScoringEngineInstancesCreatedFromThatModel(modelId)
                .then(function (scoringEngines) {
                    $scope.scoringEngineInstances = scoringEngines;
                    $scope.scoringEngineState.setLoaded();
                })
                .catch(function () {
                    $scope.scoringEngineState.setError();
                });
        }

        function getPublishAction(artifact) {
            return _.find(artifact.actions, function (action) {
                return action.toLowerCase().indexOf(MAIN_ARTIFACT_PREFIX) === 0;
            });
        }

        $scope.addScoringEngine = function () {
            if (!$scope.mainArtifact) {
                NotificationService.error("Cannot create a scoring engine from selected artifact");
                return;
            }
            $scope.state.setPending();

            var publishPath = actionToPath(getPublishAction($scope.mainArtifact));

            ScoringEngineResource
                .withErrorMessage('An error occurred while adding new scoring engine')
                .addScoringEngine(publishPath, {
                    modelId: $scope.model.id,
                    artifactId: $scope.mainArtifact.id,
                    modelName: $scope.model.name
                })
                .then(function onSuccess() {
                    NotificationService.success('Scoring engine has been added');
                    $scope.refresh();
                })
                .finally(function () {
                    $scope.state.setLoaded();
                });
        };

        $scope.supportsScoringEngines = function () {
            return $scope.mainArtifact;
        };
    });

    function actionToPath(action) {
        return action.split('_').slice(1).join('-').toLowerCase();
    }
}());
