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

    App.factory('ApplicationResource', function (Restangular) {
        var service = Restangular.service("applications");

        service.deleteApplication = function (id, cascade) {
            return this.one(id).remove({cascade: cascade});
        };

        service.getAll = function (organizationId) {
            return this.getList({org: organizationId});
        };

        service.getAllByServiceType = function (organizationId, serviceLabel) {
            return this.getList({org: organizationId, service_label: serviceLabel});
        };

        service.getApplication = function (id) {
            return this.one(id).get();
        };

        service.restart = function(appId) {
            return this.one(appId).customPUT(null, 'restart');
        };

        service.start = function(appId) {
            return this.one(appId).customPUT(null, 'start');
        };

        service.stop = function(appId) {
            return this.one(appId).customPUT(null, 'stop');
        };

        service.postStatus = function (appId, status) {
            return this.one(appId).all("status").post(status);
        };

        service.getOrphanServices = function (appId) {
            return this.one(appId).all("orphan_services").customGET("");
        };

        service.getBindings = function (appId) {
            return this.one(appId).all("bindings").customGET("")
                .then(function(bindingsResponse) {
                    return (bindingsResponse || {}).resources || [];
                });
        };

        service.bindService = function (appId, serviceId) {
            return this.one(appId).all("bindings").post({
                service_id: serviceId
            });
        };

        service.unbindService = function (appId, serviceId) {
            return this.one(appId).all("bindings").all("services").one(serviceId).remove();
        };

        return service;
    });
}());
