/**
 * Copyright (c) 2017 Intel Corporation
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

    function stringContains(str, searchText) {
        if(!str){
            return false;
        }
        return str.toLowerCase().indexOf(searchText.toLowerCase()) > -1;
    }

    function somePropertiesMatch(model, searchFields, searchText) {
        return !searchText || _.some(searchFields, function (field) {
                return stringContains(model[field], searchText);
            });
    }

    function filterByMany(collection, filterFunctions) {
        return _.reduce(filterFunctions, function (memo, filterFunction) {
            return _.filter(memo, filterFunction);
        }, collection);
    }

    App.factory('FilterUtils', function () {
        return {
            stringContains: stringContains,
            somePropertiesMatch: somePropertiesMatch,
            filterByMany: filterByMany
        };
    });
}());
