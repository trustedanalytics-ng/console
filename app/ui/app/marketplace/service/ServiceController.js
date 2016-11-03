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


    App.controller('ServiceController', function (OfferingsResource, serviceExtractor, NotificationService, $stateParams,
        targetProvider, $scope, ServiceInstancesResource, State, ApplicationRegisterResource, $location, ValidationPatterns) {

        var GATEWAY_TIMEOUT_ERROR = 504;
        
        $scope.validationPattern = ValidationPatterns.INSTANCE_NAME.pattern;
        $scope.validationMessage = ValidationPatterns.INSTANCE_NAME.validationMessage;

        var self = this,
            id = $stateParams.serviceId;

        self.serviceId = id;

        self.state = new State().setPending();
        self.deleteState = new State().setLoaded();
        self.newInstanceState = new State().setDefault();
        initNewInstance();

        function initNewInstance() {
            self.newInstance = {
                params: []
            };
        }

        self.organization = function () {
            return targetProvider.getOrganization();
        };

        self.getService = function () {
            getServiceData(self, id, OfferingsResource, serviceExtractor);
        };

        self.createServiceInstance = function (plan) {
            self.newInstanceState.setPending();
            ServiceInstancesResource
                .createInstance(
                    id,
                    self.newInstance.name,
                    plan.guid,
                    targetProvider.getOrganization().guid,
                    transformParams(self.newInstance.params)
                )
                .then(function () {
                    self.newInstanceState.setDefault();
                    NotificationService.success('Instance has been created');
                    $scope.$broadcast('instanceCreated');
                    initNewInstance();
                })
                .catch(function (error) {
                    if (error.status === GATEWAY_TIMEOUT_ERROR) {
                        self.newInstanceState.setDefault();
                        NotificationService.success("Creating an instance may take a while. Please refresh the page after a minute or two.", "Task scheduled");
                    }
                    else {
                        self.newInstanceState.setError();
                    }
                });
        };

        self.tryDeleteOffering = function() {
            NotificationService.confirm('confirm-delete-offering', { service: self.service })
                .then(function () {
                    self.state.setPending();
                    OfferingsResource
                        .withErrorMessage('Failed to delete service offering from marketplace')
                        .deleteService(self.serviceId)
                        .then(function () {
                            NotificationService.success('Application has been delete from marketplace');
                            $location.path('/app/marketplace/service');
                        }).finally(function () {
                            self.state.setLoaded();
                        });
                });
        };

        self.getService();

        self.selectPlan = function (plan) {
            self.selectedPlan = plan;
            self.newInstanceState.setDefault();
        };

        self.addExtraParam = function () {
            self.newInstance.params.push({key:null, value:null});
        };

        self.removeExtraParam = function (param) {
            self.newInstance.params = _.without(self.newInstance.params, param);
        };
    });

    function getServiceData(self, id, Service, serviceExtractor) {
        Service
            .withErrorMessage('Failed to retrieve service details')
            .getService(id)
            .then(function (serviceData) {
                self.service = serviceExtractor.extractService(serviceData || {});
                self.selectedPlan = self.service.plans[0];
                self.deletable = serviceData.deletable;
                self.state.setLoaded();
            })
            .catch(function (status) {
                self.state.setError(status);
            });
    }

    function transformParams(list) {
        // omit params with empty keys or empty values
        var filtered = _.filter(list, function (param) {
            return param.key && param.value;
        });
        // transform list of params to object structure
        return _.object(_.pluck(filtered, 'key'), _.pluck(filtered, 'value'));
    }

}());
