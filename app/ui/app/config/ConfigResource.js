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

    App.factory('ConfigResource', function (Restangular, $q) {
        var resource = Restangular.service("config");
        var sessionInfo = null;

        resource.getUploadEnvs = function () {
            return this.one("uploader").get();
        };

        resource.getSessionConfig = function (data) {
            if(sessionInfo){
                return getResolvedPromise(sessionInfo[data]);
            }
            return this.one().get().then(function(response){
                sessionInfo = response;
                return sessionInfo[data];
            });
        };

        function getResolvedPromise(data) {
            var deferred = $q.defer();
            deferred.resolve(data);
            return deferred.promise;
        }
        return resource;
    });
}());
