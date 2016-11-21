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

    App.controller('GearPumpAppDeployController', function ($scope, $window, $location, State,
        ServiceInstancesResource, GearPumpAppDeployHelper, ValidationPatterns) {

        var appArguments = {};

        $scope.uploadFormData = {};
        $scope.uploadData = {};
        $scope.services = {};
        $scope.usersParameters = [];
        $scope.state = new State().setPending();
        $scope.gpInstanceName = $location.path().split('/').pop();
        $scope.validationPattern = ValidationPatterns.INSTANCE_NAME.pattern;
        $scope.validationMessage = ValidationPatterns.INSTANCE_NAME.validationMessage;

        GearPumpAppDeployHelper.getServicesInstancesPromise(ServiceInstancesResource)
            .then(function success(data) {
                $scope.services = GearPumpAppDeployHelper.filterServices(data);
                $scope.gpUiData = GearPumpAppDeployHelper.getUiInstanceCredentials($scope.gpInstanceName, data);
                $scope.state.setLoaded();
            });

        $scope.$watchCollection('usersParameters', function () {
            $scope.usersArgumentsChange();
        });

        $scope.instanceCheckboxChange = function (instanceGuid, instanceName, serviceName, instanceMetadata) {
            if($scope.uploadFormData.instances[instanceGuid]) {
                addAppParameter(instanceName, serviceName, instanceMetadata);
            } else {
                removeAppParameter(instanceName, serviceName);
            }
        };

        $scope.setAppArguments = function (instanceGuid, serviceLabel){
            return GearPumpAppDeployHelper.setAppArguments($scope.gpInstanceName, $scope, instanceGuid, serviceLabel, appArguments,
                ServiceInstancesResource);
        };

        $scope.usersArgumentsChange = function () {
            GearPumpAppDeployHelper.usersArgumentsChange(appArguments, $scope.usersParameters, $scope.uploadFormData);
        };

        $scope.addExtraParam = function () {
            $scope.usersParameters.push({key:null, value:null});
        };

        $scope.removeExtraParam = function (param) {
            $scope.usersParameters = _.without($scope.usersParameters, param);
        };

        $scope.deployGPApp = function() {
            $scope.state.setPending();
            GearPumpAppDeployHelper.deployGPApp($scope.gpUiData.dashboardName,
                    $scope.gpUiData.username, $scope.gpUiData.password, $scope.uploadFormData)
                .finally(function() {
                    $scope.clearForm();
                    $scope.state.setLoaded();
                });
        };

        $scope.clearForm = function() {
            $scope.uploadFormData.jarFile = '';
            $scope.uploadFormData.configFile = '';
            angular.element("input[name='upfile']").val(null);
            $scope.uploadFormData.appResultantArguments = 'tap={}';
            $scope.uploadFormData.usersArguments = '';
            $scope.uploadFormData.instances = {};
            $scope.usersParameters = [];
            appArguments = {};
        };

        function addAppParameter(instanceName, serviceName, instanceMetadata) {
            if(!appArguments[serviceName]) {
                appArguments[serviceName] = {};
            }

            appArguments[serviceName][instanceName] = GearPumpAppDeployHelper.parseMetadata(instanceMetadata);
            $scope.uploadFormData.appResultantArguments = 'tap=' + angular.toJson(appArguments);
        }

        function removeAppParameter(instanceName, serviceName) {
            if(appArguments[serviceName] && appArguments[serviceName][instanceName]) {
                delete appArguments[serviceName][instanceName];

                if(_.isEmpty(appArguments[serviceName])) {
                    delete appArguments[serviceName];
                }
                $scope.uploadFormData.appResultantArguments = 'tap=' + angular.toJson(appArguments);
            }
        }
    });
}());
