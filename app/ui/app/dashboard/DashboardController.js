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

    App.controller('DashboardController', function ($scope, State) {

        var state = new State().setPending();
        $scope.state = state;

        var DEFAULT_GRAFANA_PREFIX = '/rest/grafana/render/dashboard-solo/db';
        var DEFAULT_DASHBOARD_PARAMS = {
            to: 'now',
            theme: 'light',
            height: 200,
            width: 400
        };

        $scope.getIframeSrc = function(number, dashboardName, timeBack) {
            var params = _.chain({panelId: number, from: timeBack})
                .extend(DEFAULT_DASHBOARD_PARAMS)
                .mapObject(function(v, k){return k + '=' + v;})
                .values()
                .value()
                .join('&');

            return DEFAULT_GRAFANA_PREFIX + '/' + dashboardName + '?' + params;
        };
    });
}());
