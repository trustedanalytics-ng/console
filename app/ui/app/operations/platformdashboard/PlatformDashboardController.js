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

    App.controller('PlatformDashboardController', function ($scope, State, NotificationService,
        $state, $location, ConfigResource) {

        var state = new State().setPending();
        $scope.state = state;

        var DEFAULT_GRAFANA_PREFIX = '/dashboard-solo/db';
        var DEFAULT_SINCE = '1h';
        var DEFAULT_DASHBOARD_PARAMS = {
            from: 'now-' + DEFAULT_SINCE,
            to: 'now',
            theme: 'light'
        };
     
        ConfigResource.getSessionConfig('metrics_grafana_host')
            .then(function onSuccess(response) {
                $scope.response = response;
                $scope.getIframeSrc = function(number, dashboardName) {
                    var params = _.chain({panelId: number})
                        .extend(DEFAULT_DASHBOARD_PARAMS)
                        .mapObject(function(v, k){return k + '=' + v;})
                        .values()
                        .value()
                        .join('&');

                    return "//" + response + DEFAULT_GRAFANA_PREFIX + '/' + dashboardName + '?' + params;
                };
            }).catch(function onError() {
            state.setError();
        });

        var self = this;
        self.isTabActive = function (sref) {
            return $state.is(sref) || $state.includes(sref);
        };
    });
}());
