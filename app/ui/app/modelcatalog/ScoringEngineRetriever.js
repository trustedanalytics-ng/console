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

    App.factory('ScoringEngineRetriever', function (ServiceInstancesResource) {
        var API_DOCS_SUFFIX = '/api-docs';

        return {
            getScoringEngineInstancesCreatedFromThatModel: getScoringEngineInstancesCreatedFromThatModel
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
                            return (url ? _.extend(scoringEngine, {url: url.value + API_DOCS_SUFFIX}) : _.extend(scoringEngine, {url: "Not yet available"}));
                        })
                        .value();
                });
        }
    });
}());
