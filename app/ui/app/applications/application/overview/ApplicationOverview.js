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

    App.component('applicationOverview', {
        bindings: {
            application: '<',
            onDelete: '&',
            onRestage: '&',
            onStart: '&',
            onStop: '&',
            onRefresh: '&'
        },
        templateUrl: 'app/applications/application/overview/overview.html',
        controller: function($scope, InstanceState) {
            this.InstanceState = InstanceState;

            this.appStateEquals = function (state) {
                return this.application && this.application.state === state;
            };

            this.appStateIn = function (states) {
                return this.application && _.contains(states, this.application.state);
            };

            this.isRunning = _.partial(this.appStateEquals, InstanceState.RUNNING);
            this.isStopped = _.partial(this.appStateEquals, InstanceState.STOPPED);

            this.canBeStarted = this.isStopped;
            this.canBeStopped = this.isRunning;
            this.canBeRestarted = this.isRunning;

            this.canBeDeleted = _.partial(this.appStateIn, [
                InstanceState.STOPPED,
                InstanceState.FAILURE,
                InstanceState.UNAVAILABLE
            ]);
        }
    });

}());
