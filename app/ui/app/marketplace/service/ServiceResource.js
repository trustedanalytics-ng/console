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

    App.factory('ServiceResource', function (Restangular) {
        var service = Restangular.service("catalog");
        service.getService = function (id) {
            return this.one(id).get();
        };

        service.getListBySpace = function (space) {
            return this.one().customGET("", {space: space});
        };

        service.getAllServicePlansForLabel = function (label) {
            return this.one(label).one("service_plans").get();
        };

        service.deleteService = function(id) {
            return this.one(id).remove();
        };

        return service;
    });
}());
