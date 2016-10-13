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

    App.controller('MainController', function($scope, AppConfig, targetProvider, NotificationService, $window, Idle,
                                              Keepalive, UserProvider, ConfigResource, $http, PlatformInfoProvider) {
        $scope.appConfig = AppConfig;
        $scope.year = new Date().getFullYear();
        $scope.infoConfig = {
            'position-class': 'toast-top-right',
            'close-button':true,
            'toaster-id':'top-right'
        };
        $scope.errorConfig = {
            'position-class': 'toast-top-right',
            'close-button': true,
            'toaster-id': 'full-width',
            'tap-to-dismiss': false,
            limit: 3
        };

        ConfigResource.getSessionConfig('session_config')
            .then(function onSuccess(configData) {
                Idle.setIdle(configData.idle_time);
                Keepalive.setInterval(configData.keepalive_time);
                Idle.watch();
        });

        $scope.$on('IdleStart', function() {
            targetProvider.clear();
            $http.get('/logout');
            NotificationService.info('confirm-logout')
                .then(function () {
                    $window.location.href = '/logout';
                });
        });


        PlatformInfoProvider.getPlatformInfo()
            .then(function (response) {
                $scope.platformInfo = response;
            });

        UserProvider.isAdmin().then(function (isAdmin) {
            $scope.isAdmin = isAdmin;
        });

     });
})();
