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

    App.controller('WorkflowJobController', function ($scope, State, WorkflowJobResource, $stateParams,
                                                      NotificationService, targetProvider, PlatformInfoResource) {

        var state = new State().setPending();
        $scope.state = state;
        var regExpCheckTargetDir = new RegExp("((hdfs):\/{2})+([a-z0-9])+\/");
        var fileBrowserUrl;
        $scope.activeUrl = false;


        WorkflowJobResource.getJob($stateParams.workflowjobId, targetProvider.getOrganization().guid)
            .then(function (response) {
                $scope.job = response;
                $scope.state = state.setLoaded();
            }).catch(function onError() {
                state.setError();
            });


        WorkflowJobResource.getLogs($stateParams.workflowjobId, targetProvider.getOrganization().guid)
            .then(function (response) {
                $scope.logs = response.logs;
                $scope.state = state.setLoaded();
            }).catch(function onError() {
                state.setError();
            });

        $scope.onStatusChange = function(action){
            WorkflowJobResource.changeJobStatus($stateParams.workflowjobId, action)
                .then(function onSuccess(){
                    NotificationService.success('Changing job status on killed');
                }).catch(function onError(){
                    state.setError();
                });
        };

        $scope.toKilled = function(status){
            return (status !== 'KILLED' && status !=='FAILED' && status !=='DONEWITHERROR');
        };

        PlatformInfoResource.getPlatformInfo()
            .then(function (response) {
                fileBrowserUrl = _.findWhere(response.external_tools.visualizations, {name: "hue-file-browser"}).url;
                $scope.activeUrl = true;
            }).catch(function onError() {
                state.setError();
            });

        $scope.getHref = function() {
            return fileBrowserUrl + "/#/" + $scope.job.targetDirs[0].replace(regExpCheckTargetDir, "");
        };
    });
}());