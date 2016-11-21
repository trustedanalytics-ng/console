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
    'use strict';

    App.factory('GearPumpAppDeployHelper', function (NotificationService, targetProvider, ToolsInstanceResource,
         GearPumpAppDeployResource, ServiceInstancesMapper, FileUploaderService) {

        var GP_SERVICES_WHITE_LIST = ['kafka', 'cloudera-config'];
        var METADATA_SETTINGS_KEY = 'VCAP';
        var GEARPUMP_CONSOLE_ADDRESS = ['/rest/gearpump/', '/api/v1.0/master/submitapp'];

        return {
            getUiInstanceCredentials: getUiInstanceCredentials,
            getServicesInstancesPromise: getServicesInstancesPromise,
            filterServices: filterServices,
            deployGPApp: deployGPApp,
            usersArgumentsChange: usersArgumentsChange,
            parseMetadata: parseMetadata
    };

        function usersArgumentsChange(appArguments, usersParameters, uploadFormData) {
            appArguments.usersArgs = _.chain(usersParameters)
                .filter(function (parameter) {
                    return parameter.key;
                })
                .map(function(element) {
                    return [element.key, element.value];
                })
                .object()
                .value();

            if(angular.equals(appArguments.usersArgs, {})) {
                delete appArguments.usersArgs;
            }
            uploadFormData.appResultantArguments = 'tap=' + angular.toJson(appArguments);
        }

        function deployGPApp(uiInstanceName, login, password, uploadFormData) {
            return getGPTokenPromise(uiInstanceName, login, password)
                .then(function() {

                    var data = {
                        configstring: uploadFormData.appResultantArguments
                    };

                    var files = {
                        jar: uploadFormData.jarFile,
                        configfile: uploadFormData.configFile
                    };

                    var url = GEARPUMP_CONSOLE_ADDRESS[0] + uiInstanceName + GEARPUMP_CONSOLE_ADDRESS[1];

                    var uploader = FileUploaderService.uploadFiles(url, data, files, function (response) {
                        return {
                            message: response.status + ': ' + response.data,
                            close: false
                        };
                    });

                    return NotificationService.progress(uploader);
                });
        }

        function getUiInstanceCredentials(name, services) {
            var service = _.findWhere(services, { name: name });

            var vcap = angular.fromJson(_.findWhere(service.metadata, {key: METADATA_SETTINGS_KEY}));
            if(vcap && vcap.value) {
                var metadata = angular.fromJson(vcap.value).credentials;
                metadata.dashboardName = metadata.dashboardUrl.split('.')[0];
                return metadata;
            }
            return null;
        }

        function getGPTokenPromise(gpInstance, username, password) {
            return GearPumpAppDeployResource.getGPToken(gpInstance, username, password);
        }

        function getServicesInstancesPromise(ServiceInstancesResource) {
            return ServiceInstancesResource
                .withErrorMessage('Error loading service keys')
                .getAll();
        }

        function filterServices(data, whiteList) {
            whiteList = whiteList || GP_SERVICES_WHITE_LIST;

            var servicesToCheck = _.filter(data, function (service) { return _.contains(whiteList, service.serviceName); });
            return _.groupBy(servicesToCheck, 'serviceName');
        }

        function parseMetadata(metadata) {
            return _.object(_.map(metadata, function(element) {
                return [element.key, element.value];
            }));
        }
    });
}());