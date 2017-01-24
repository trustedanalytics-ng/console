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

    App.factory('ScoringEngineRetriever', function (ServiceInstancesResource, ScoringEngineResource, NotificationService) {
        var API_DOCS_SUFFIX = '/api-docs';
        var MAIN_ARTIFACT_PREFIX = 'publish_';

        return {
            getScoringEngineInstancesCreatedFromThatModel: getScoringEngineInstancesCreatedFromThatModel,
            createScoringEngine: createScoringEngine,
            getPublishAction: getPublishAction
        };

        function getScoringEngineInstancesCreatedFromThatModel (modelId) {
            return ServiceInstancesResource.getAll()
                .then(function (instances) {
                    return _.chain(instances)
                        .filter(function (instance) {
                            return _.where(instance.metadata, {key: "MODEL_ID", value: modelId}).length;
                        })
                        .map(function(scoringEngine) {
                            var url = _.findWhere(scoringEngine.metadata, {key: 'urls'});
                            return url ? _.extend(scoringEngine, {url: url.value + API_DOCS_SUFFIX}) : scoringEngine;
                        })
                        .value();
                });
        }

        function createScoringEngine(modelId, modelName, artifact) {
            var publishPath = actionToPath(getPublishAction(artifact));
            return ScoringEngineResource
                .withErrorMessage('An error occurred while adding new scoring engine')
                .addScoringEngine(publishPath, {
                    modelId: modelId,
                    artifactId: artifact.id,
                    modelName: modelName
                })
                .then(function onSuccess() {
                    NotificationService.success('Scoring engine has been added');
                });
        }

        function getPublishAction(artifact) {
            if(!artifact) {
                return null;
            }
            return _.find(artifact.actions || [], function (action) {
                return action.toLowerCase().indexOf(MAIN_ARTIFACT_PREFIX) === 0;
            });
        }

        function actionToPath(action) {
            return action.split('_').slice(1).join('-').toLowerCase();
        }
    });
}());
