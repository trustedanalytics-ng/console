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

    App.controller('AppDevelopmentController', function ($scope, userAgent, CliConfiguration, PlatformInfoProvider,
            UserProvider) {

        var CLI_BASE_PATH = '/rest/resources/cli/';

        $scope.cliList = CliConfiguration;
        $scope.autoChosenCli = autoChooseCli(userAgent, CliConfiguration);
        UserProvider.getUser()
            .then(function(user) {
                $scope.username = user.username;
            });

        PlatformInfoProvider
            .getPlatformInfo()
            .then(function onSuccess(platformContext) {
                $scope.apiEndpoint = platformContext.api_endpoint.replace(/\/$/, '');
            });

        $scope.getCliUrl = function(cli) {
            return CLI_BASE_PATH + cli.release;
        };
    });

    function autoChooseCli(userAgent, cliList) {
        return _.findWhere(cliList, {
            release: getRelease(userAgent)
        });
    }

    function getRelease(userAgent) {
        switch(userAgent.family) {
            case 'windows':
                return 'windows32';
            case 'osx':
                return 'macosx' + getArchitecture(userAgent);
            default:
                return userAgent.family + getArchitecture(userAgent);
        }
    }

    function getArchitecture(userAgent) {
        return is64Bit(userAgent) ? '64' : '32';
    }

    function is64Bit(userAgent) {
        return (userAgent.cpu || {}).architecture === 'amd64';
    }
}());
