/**
 * Copyright (c) 2016 Intel Corporation
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

(function() {
    'use strict';

    App.factory('InstanceStateInterpreter', function (InstanceState) {

        return {
            stateEquals: stateEquals,
            stateIn: stateIn,

            isRunning: _.partial(stateEquals, InstanceState.RUNNING),
            isStopped: _.partial(stateEquals, InstanceState.STOPPED),

            canBeStarted: _.partial(stateEquals, InstanceState.STOPPED),
            canBeRestarted: _.partial(stateEquals, InstanceState.RUNNING),
            canBeStopped: _.partial(stateEquals, InstanceState.RUNNING),
            canBeDeleted: _.partial(stateIn, [
                InstanceState.STOPPED,
                InstanceState.FAILURE
            ])
        };

        function stateEquals(state, instance) {
            return instance && instance.state === state;
        }

        function stateIn(states, instance) {
            return instance && _.contains(states, instance.state);
        }
    });
}());