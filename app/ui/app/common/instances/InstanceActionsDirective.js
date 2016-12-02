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

    App.component('instanceActions', {
        bindings: {
            instance: '<',
            onDelete: '&',
            onRestart: '&',
            onStart: '&',
            onStop: '&',
            onRefresh: '&'
        },
        controller: function(InstanceStateInterpreter) {
            this.canBeStarted = wrapInterpreter(InstanceStateInterpreter.canBeStarted);
            this.canBeStopped = wrapInterpreter(InstanceStateInterpreter.canBeStopped);
            this.canBeRestarted = wrapInterpreter(InstanceStateInterpreter.canBeRestarted);
            this.canBeDeleted = wrapInterpreter(InstanceStateInterpreter.canBeDeleted);

            function wrapInterpreter(fn) {
                return function() {
                    return fn(this.instance);
                };
            }
        },
        templateUrl: 'app/common/instances/instance-actions.html'
    });
}());
