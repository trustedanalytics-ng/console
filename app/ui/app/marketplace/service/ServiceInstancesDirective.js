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

    App.controller('ServiceInstancesController', function (ServiceInstancesResource, $scope, targetProvider, State,
        NotificationService) {

        var self = this,
            id = $scope.serviceId;

        var GATEWAY_TIMEOUT_ERROR = 504;

        var state = new State().setPending();
        self.state = state;

        self.instancesState = new State().setLoaded();
        self.deleteState = new State().setDefault();

        self.getInstances = function () {
            getInstancesData(self, targetProvider.getOrganization(), id, $scope.serviceName, ServiceInstancesResource);
        };

        var updateInstances = function () {
            self.instancesState.setPending();
            self.deleteState.setDefault();
            self.getInstances();
        };

        // TODO: remove scope watch when DPNG-10877 is done - just update on init
        $scope.$watch('serviceName', function(value) {
            if(value) {
                updateInstances();
            }
        });

        $scope.$on('instanceCreated', function () {
            updateInstances();
        });

        self.tryDeleteInstance = function (instance) {
            NotificationService.confirm('confirm-delete', {instanceToDelete: instance})
                .then(function onConfirm() {
                    self.deleteInstance(instance);
                });
        };

        self.deleteInstance = function (instance) {
            if (!instance) {
                return;
            }

            self.deleteState.setPending();
            ServiceInstancesResource
                .supressGenericError()
                .deleteInstance(instance.id)
                .then(function () {
                    self.deleteState.setDefault();
                    NotificationService.success('Instance has been deleted');
                    updateInstances();
                })
                .catch(function (error) {
                    if (error.status === GATEWAY_TIMEOUT_ERROR) {
                        NotificationService.success("Deleting an instance may take a while. Please refresh the page after a minute or two.", "Task scheduled");
                    }
                    else {
                        NotificationService.genericError(error.data, 'Error while deleting the instance');
                    }
                    self.deleteState.setDefault();
                });
        };

        $scope.$on('targetChanged', function () {
            updateInstances();
        });

        self.organization = targetProvider.getOrganization;

        self.refresh = updateInstances;

        self.getNormalizedState = function(instance) {
            return instance.state.replace(/\s+/g, '-').toLowerCase();
        };
    });


    App.directive('dServiceInstances', function () {
        return {
            scope: {
                serviceId: '=',
                serviceName: '='
            },
            controller: 'ServiceInstancesController as ctrl',
            templateUrl: 'app/marketplace/service/service-instances.html'
        };
    });


    function getInstancesData(self, organization, serviceId, serviceName, ServiceInstancesResource) {
        ServiceInstancesResource
            .withErrorMessage('Failed to retrieve service instances')
            .getAllByType(organization.guid, serviceId)
            .then(function (instances) {
                // TODO: remove filtering when DPNG-10877 is done
                self.instances = _.where(instances, {serviceName: serviceName});
                self.instancesState.setLoaded();
            })
            .catch(function () {
                self.instancesState.setError();
            });
    }

}());
