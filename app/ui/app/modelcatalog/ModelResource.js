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

    App.factory('ModelResource', function (Restangular) {
        var resource = Restangular.service("models");

        resource.getModels = function (orgId) {
            return this.one().customGET("", {'orgId': orgId});
        };

        resource.getModelMetadata = function (modelId){
            return this.one(modelId).get();
        };

        resource.deleteModel = function (modelId) {
            return this.one(modelId).remove();
        };

        resource.updateModelMetadata = function (modelId, body) {
            return this.one(modelId).patch(body);
        };

        resource.deleteModelArtifact = function (modelId, artifactId) {
            return this.one(modelId).one('artifacts', artifactId).remove();
        };

        resource.addModelMetadata = function (orgId, body) {
            return this.one().customPOST(body,"", {'orgId': orgId});
        };

        return resource;
    });
}());
