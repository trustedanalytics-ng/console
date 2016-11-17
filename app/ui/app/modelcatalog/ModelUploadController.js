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

    App.controller('ModelUploadController', function ($scope, $rootScope, ModelUploadConfig, ModelResource, targetProvider, NotificationService, $state,
                                                      State, FileUploaderService, supportedExtensions, artifactActions, ValidationPatterns, ModelUploadService) {

        $scope.uploadModel = new ModelUploadConfig();


        $scope.validationPattern = ValidationPatterns.MODEL_UPLOAD.pattern;
        $scope.validationMessage = ValidationPatterns.MODEL_UPLOAD.validationMessage;
        $scope.supportedExtension = supportedExtensions.other;

        $scope.state = new State().setLoaded();

        $scope.addModel = function () {
            $scope.state.setPending();
            ModelUploadService
                .addModelMetadata($scope.uploadModel)
                .then(function onSuccess(model) {
                    NotificationService.success('Model metadata has been uploaded');
                    ModelUploadService.addModelArtifact($scope.uploadModel, model.id)
                        .then(function onSuccess() {
                            NotificationService.success('Model artifact has been uploaded');
                            $scope.state.setLoaded();
                            $state.go('app.modelcatalog.models');
                        }).catch(function onError() {
                            NotificationService.error('Error occurred while uploading new model');
                        });
                });
        };

        $scope.typeChanged = function () {
            $scope.supportedExtension = supportedExtensions[$scope.uploadModel.modelType] || supportedExtensions.other;
            $scope.uploadModel.artifactAction = artifactActions[$scope.uploadModel.modelType] || artifactActions.other;
        };
    });
}());
