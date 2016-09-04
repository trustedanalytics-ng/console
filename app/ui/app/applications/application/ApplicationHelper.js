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

(function() {
    'use strict';

    App.factory('ApplicationHelper', function(ApplicationResource, NotificationService, $q, $state) {

        return {
            restartApplication: restartApplication,
            startApplication: startApplication,
            stopApplication: stopApplication,
            getApplication: getApplication,
            deleteApplication: deleteApplication
        };

        function restartApplication(appId) {
            return instanceAction(appId, 'restart');
        }

        function startApplication(appId) {
            return instanceAction(appId, 'start');
        }

        function stopApplication(appId) {
            return instanceAction(appId, 'stop');
        }

        function instanceAction(appId, action) {
            var msg = {
                stop : ['Application has been stopped', 'Stopping the application failed'],
                start : ['Application has been started', 'Starting application failed'],
                restart: ['Application has been restarted', 'Restarting application failed']
            };
            return ApplicationResource
                .withErrorMessage(msg[action][1])
                [action](appId)
                .then(function onSuccess() {
                    NotificationService.success(msg[action][0]);
                });
        }

        function getApplication(appId) {
            return ApplicationResource
                .withErrorMessage('Failed to load application details')
                .getApplication(appId);
        }

        function deleteApplication(state, appId) {
            state.setPending();

            ApplicationResource
                .withErrorMessage('Deleting application failed')
                .deleteApplication(appId)
                .then(function onSuccess() {
                    $state.go('app.applications');
                    NotificationService.success('Application has been deleted');
                })
                .catch(function onError() {
                    state.setLoaded();
                });
        }
    });

}());
