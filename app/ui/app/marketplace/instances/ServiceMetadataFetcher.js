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

(function() {
    'use strict';

    App.factory('ServiceMetadataFetcher', function () {

        return {
            getLogin: getLogin,
            getPassword: getPassword,
            getUrl: getUrl
        };

        function getLogin(instance) {
            return getMetadataValue(instance, ["username", "login"]);
        }

        function getPassword(instance) {
            return getMetadataValue(instance, ["password"]);
        }

        function getUrl(instance) {
            var urls = getMetadataValue(instance, ["urls"]);
            return _.isArray(urls) ? urls[0] : urls;
        }

        function getMetadataValue(instance, listOfPossibleKeys) {
            var metaObject = _.find(instance.metadata, function(meta) {
                    return _.isString(meta.key) && _.contains(listOfPossibleKeys, meta.key.toLowerCase());
                }) || {};
            return metaObject.value;
        }
    });
}());