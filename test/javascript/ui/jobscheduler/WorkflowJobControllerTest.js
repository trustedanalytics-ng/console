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

describe("Unit: WorkflowJobController", function() {

    var controller, scope, targetProvider, workflowJobResource, notificationService, $q, platformInfoResource;
    var JOB_ID = "job-id", workflowJobResourceDefer, platformInfoResourceDefer;

    beforeEach(module("app:core"));

    beforeEach(inject(function($controller, $rootScope, _$q_){
        scope = $rootScope.$new();
        $q = _$q_;

        targetProvider = {
            getOrganization: sinon.stub().returns({ guid: 'o2' })
        };

        notificationService = {
            confirm: function() {
                return $q.defer().promise;
            },
            success: function(){}
        };

        createController = function () {
            controller = $controller('WorkflowJobController', {
                $scope: scope,
                $stateParams: {workflowjobId: JOB_ID},
                targetProvider: targetProvider,
                NotificationService: notificationService,
                WorkflowJobResource: workflowJobResource,
                PlatformInfoResource: platformInfoResource
            });
        };

        workflowJobResourceDefer = $q.defer();
        platformInfoResourceDefer = $q.defer();

        workflowJobResource = {
            getJob: sinon.stub().returns(workflowJobResourceDefer.promise),
            getLogs: sinon.stub().returns(workflowJobResourceDefer.promise),
            changeJobStatus: sinon.stub().returns(workflowJobResourceDefer.promise)
        };

        platformInfoResource = {
            getPlatformInfo: sinon.stub().returns(platformInfoResourceDefer.promise)
        }
    }));

    it('should not be null', function () {
        controller = createController();

        expect(controller).not.to.be.null;
    });

    it('init, set pending and get job details', function () {
        createController();

        expect(scope.state.isPending(), 'pending').to.be.true;
        expect(workflowJobResource.getJob).to.be.called;
    });

    it('init, set loaded and check response for getting jobs', function () {
        createController();
        workflowJobResourceDefer.resolve("response");
        platformInfoResourceDefer.resolve({"external_tools": {"visualizations": [{"name": "hue-file-browser", "url": "hue.url"}]}});
        scope.$apply();

        expect(scope.state.isLoaded(), 'loaded').to.be.true;
        expect(workflowJobResource.getJob).to.be.called;
        expect(scope.job).to.be.equal("response");
        expect(platformInfoResource.getPlatformInfo).to.be.called;
    });


    it('init, set loaded and check if job status was changed', function () {
        createController();
        var deferred = $q.defer();
        var changedSpied = sinon.spy(notificationService, 'success');
        workflowJobResource.changeJobStatus = function() {
            return deferred.promise;
        };
        deferred.resolve();

        scope.onStatusChange();
        scope.$digest();

        expect(changedSpied.called).to.be.true;
    });

    it('init, set pending and get job logs', function () {
        createController();

        expect(scope.state.isPending(), 'pending').to.be.true;
        expect(workflowJobResource.getLogs).to.be.called;
    });

});