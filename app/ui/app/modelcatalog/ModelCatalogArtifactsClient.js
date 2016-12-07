/**
 * Copyright (c) 2016 Intel Corporation
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

    App.factory('ModelCatalogArtifactsClient', function (ModelResource, NotificationService, FileUploaderService) {

        return {
            deleteArtifact: deleteArtifact,
            uploadArtifact: uploadArtifact
        };

        function deleteArtifact (modelId, artifactId, deleteArtifactState, getModelMetadata) {
            deleteArtifactState.setPending();
            ModelResource
                .withErrorMessage('Error occurred while deleting model artifact.')
                .deleteModelArtifact(modelId, artifactId)
                .then(function () {
                    NotificationService.success('Model Artifact has been deleted');
                    getModelMetadata();
                })
                .finally(function () {
                    deleteArtifactState.setDefault();
                });
        }

        function uploadArtifact (modelId, file, addArtifactState, getModelMetadata) {
            addArtifactState.setPending();
            var url = '/rest/models/' + modelId + '/artifacts';
            var files = {artifactFile: file};
            var uploader = FileUploaderService
                .uploadFiles(url, {}, files, function (response) {
                    var message = response.status + ': ' + (response.data ? response.data.message : '');

                    NotificationService.error(message);
                    return {
                        message: message,
                        close: true
                    };
                });

            NotificationService.progress(uploader)
                .then(function() {
                    getModelMetadata();
                    addArtifactState.setDefault();
                });
        }

    });
}());
