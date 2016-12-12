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
    "use strict";

    App.service('ModelUploadService', function (ModelResource, targetProvider, $state, NotificationService, FileUploaderService, Upload) {

        return {
            addModelMetadata: function (model) {

                return ModelResource
                        .withErrorMessage('Error occurred while uploading model entity')
                        .addModelMetadata(targetProvider.getOrganization().guid, {
                            name: model.name,
                            algorithm: model.method,
                            revision: "1.0",
                            creationTool: model.modelType,
                            description: model.description
                        });

            },
            addModelArtifact: function (model, modelId) {

                var files = {
                    artifactFile: model.filename,
                    artifactActions: Upload.jsonBlob(model.artifactAction)
                };

                var url = '/rest/models/' + modelId + '/artifacts';

                var uploader = FileUploaderService.uploadFiles(url, {}, files, function (response) {
                    var message = response.status + ': ' + (response.data ? response.data.message : '');

                    NotificationService.error(message);
                    return {
                        message: message,
                        close: true
                    };
                });

                return NotificationService.progress(uploader);
            }
        };
    });
}());