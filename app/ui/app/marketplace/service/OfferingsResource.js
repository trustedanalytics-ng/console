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

    App.factory('OfferingsResource', function (Restangular, targetProvider) {
        var offering = Restangular.service("offerings");
        offering.getOffering = function (id) {
            return offering.one(id).get();
        };

        offering.getAll = function () {
            return this.one().customGET("", {org: targetProvider.getOrganization().guid});
        };

        offering.deleteOffering = function (id) {
            return this.one(id).remove();
        };

        offering.createFromApplication = function(offeringRequest) {
            return this.one('application').post(null, offeringRequest);
        };

        return offering;
    });
}());
