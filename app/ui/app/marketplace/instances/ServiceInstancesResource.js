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

    App.factory('ServiceInstancesResource', function (Restangular) {
        var service = Restangular.service("services");

        service.createInstance = function(offeringId, name, planGuid, envs) {
            return service.post({
                offeringId: offeringId,
                name: name,
                type: 'SERVICE',
                metadata: [{
                    key: 'PLAN_ID',
                    value: planGuid
                }].concat(_.defaults([], envs))
            });
        };

        service.deleteInstance = function (serviceId) {
            return service.one(serviceId).remove();
        };

        service.startInstance = function (offeringId) {
            return service.one(offeringId).one('start').put();
        };

        service.stopInstance = function (offeringId) {
            return service.one(offeringId).one('stop').put();
        };

        service.restartInstance = function (offeringId) {
            return service.one(offeringId).one('restart').put();
        };

        service.getAllByType = function (organizationId, offeringId) {
            return service.getList({
                org: organizationId,
                offeringId: offeringId
            });
        };

        service.getAll = function () {
            return service.getList();
        };

        service.getById = function (instanceId) {
            return service.one(instanceId).get();
        };

        service.getCredentials = function (serviceId) {
            return service.one(serviceId).one('credentials').get();
        };

        return service;
    });


}());
