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

    App.factory('PlatformInfoProvider', function (PlatformInfoResource, OfferingsResource, $q) {
        var platformInfo = null;
        var externalTools = {};
        return {
            getPlatformInfo: function () {
                if (platformInfo) {
                    return getResolvedPromise(platformInfo);
                }

                return PlatformInfoResource
                    .withErrorMessage("Error while fetching platform info")
                    .getPlatformInfo()
                    .then(function success(data) {
                        platformInfo = data.plain();
                        return platformInfo;
                    });
            },
            getExternalTools: function (org) {
                return OfferingsResource
                    .withErrorMessage("Error while fetching catalog")
                    .getAll()
                    .then(function success(data) {
                        externalTools[org] = _.map(data, function(offering) {
                                return {
                                    name: offering.name,
                                    available: true
                                };
                            });
                        return externalTools[org];
                    });
            }
        };

        function getResolvedPromise(data) {
            var deferred = $q.defer();
            deferred.resolve(data);
            return deferred.promise;
        }
    });

}());
