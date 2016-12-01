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

    App.value('ModelsMock', [
        {
            name: 'name',
            creationTool: 'H2O',
            algorithm: 'alg',
            addedOn: Date.now() + 48 * 3600 * 1000,
            artifacts: [{id: '1234-1234', actions: []}, {id: '4321-1234', actions: ['publish_whatever']}]
        }, {
            name: 'test',
            creationTool: 'H2O',
            addedOn: Date.now() + 24 * 3600 * 1000,
            artifacts: [{id: '1234-1234', actions: ['publish_whatever']}]
        }, {
            name: 'sample-model',
            creationTool: 'Other',
            algorithm: 'algorithm-name',
            addedOn: Date.now() - 24 * 3600 * 1000,
            artifacts: [{id: '1234-1234', actions: []}, {id: '4321-1234', actions: ['some-action']}]
        }, {
            name: 'mock-model',
            creationTool: 'SparkTK',
            algorithm: 'mock-spark',
            addedOn: Date.now() - 48 * 3600 * 1000,
            artifacts: [{id: '1234-1234', actions: []}, {id: '4321-1234', actions: ['some-action']}]
        }
    ]);
}());