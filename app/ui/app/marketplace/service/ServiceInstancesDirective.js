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

    App.controller('ServiceInstancesController', function (ServiceInstancesResource, $scope, targetProvider, State) {

        var self = this;

        var state = new State().setPending();
        self.state = state;

        self.getInstances = function () {
            getInstancesData(self, targetProvider.getOrganization(), this.offeringId, ServiceInstancesResource);
        };
        self.getInstances();

        $scope.$on('instanceCreated', function () {
            self.getInstances();
        });

        $scope.$on('targetChanged', function () {
            self.getInstances();
        });

        self.organization = targetProvider.getOrganization;

        self.getNormalizedState = function(instance) {
            return instance.state.replace(/\s+/g, '-').toLowerCase();
        };
    });


    App.component('dServiceInstances', {
        bindings: {
            offeringId: '<'
        },
        controller: 'ServiceInstancesController',
        templateUrl: 'app/marketplace/service/service-instances.html'
    });


    function getInstancesData(self, organization, offeringId, ServiceInstancesResource) {
        self.state.setPending();
        ServiceInstancesResource
            .withErrorMessage('Failed to retrieve service instances')
            .getAllByType(organization.guid, offeringId)
            .then(function (instances) {
                self.instances = instances;
                self.state.setLoaded();
            })
            .catch(function () {
                self.state.setError();
            });
    }

}());
