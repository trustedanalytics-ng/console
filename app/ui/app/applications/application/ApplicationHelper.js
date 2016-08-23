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

    App.factory('ApplicationHelper', function(ServiceInstancesResource, ApplicationResource, NotificationService, $q, $state) {

        return {
            restageApplication: restageApplication,
            startApplication: startApplication,
            stopApplication: stopApplication,
            getApplication: getApplication,
            deleteApp: deleteApp
        };

        function restageApplication(state, appId) {
            instanceAction(state, appId,'RESTAGING');
        }

        function startApplication(state, appId) {
            instanceAction(state, appId,'STARTED');
        }

        function stopApplication(state, appId) {
            instanceAction(state, appId, 'STOPPED');
        }

        function instanceAction(state, appId, action) {
            state.setPending();

            var msg = {
                'STOPPED' : ['Stopping the application has been scheduled.', 'Stopping the application failed.'],
                'STARTED' : ['Starting application has been scheduled.', 'Starting application failed'],
                'RESTAGING': ['Restage has been scheduled', 'Restaging application failed']
            };

            ApplicationResource.postStatus(appId, {
                state: action
            })
                .then(function onSuccess() {
                    NotificationService.success(msg[action][0]);
                })
                .catch(function onError() {
                    NotificationService.error(msg[action][1]);
                })
                .finally(function () {
                    state.setLoaded();
                });
        }

        function getApplication(appId) {
            return ApplicationResource
                .withErrorMessage('Failed to load application details')
                .getApplication(appId);
        }

        function deleteApp(state, appId) {
            state.setPending();

            /*ApplicationResource
                .getOrphanServices(appId)
                .then(function onSuccess(servicesToDelete) {
                    state.setLoaded();
                    NotificationService.confirm('confirm-delete', {servicesToDelete: servicesToDelete})
                        .then(function (cascade) {
                            state.setPending();
                            return ApplicationResource
                                .withErrorMessage('Deleting application failed')
                                .deleteApplication(appId, cascade[0]);
                        })
                        .then(function onSuccess() {
                            $state.go('app.applications');
                            NotificationService.success('Application has been deleted');
                        })
                        .finally(function onError() {
                            state.setLoaded();
                        });
                })*/
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