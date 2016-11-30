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
/*jshint -W030 */
describe("Unit: ApplicationController", function () {

    var controller,
        createController,
        applicationStateClient,
        applicationResource,
        serviceInstancesResource,
        notificationService,
        state,
        $state,
        $q,
        $scope,
        APP_ID = "app-guid",
        SAMPLE_APP = { guid: APP_ID };

    beforeEach(module('app'));

    beforeEach(inject(function(_$q_, $rootScope, $controller, State) {
        $q = _$q_;
        $scope = $rootScope.$new();

        applicationStateClient = {
            startApplication: sinon.stub().returns($q.defer().promise),
            stopApplication: sinon.stub().returns($q.defer().promise),
            restartApplication: sinon.stub().returns($q.defer().promise)
        };

        applicationResource = {
            withErrorMessage: sinon.stub().returnsThis(),
            supressGenericError: sinon.stub().returnsThis(),
            getApplication: sinon.stub().returns($q.defer().promise),
            deleteApplication: sinon.stub().returns($q.defer().promise)
        };
        serviceInstancesResource = {
            supressGenericError: sinon.stub().returnsThis(),
            getAll: sinon.stub().returns($q.defer().promise)
        };
        notificationService = {
            success: sinon.stub(),
            confirm: sinon.stub().returns($q.defer().promise),
            error: sinon.stub(),
            genericError: sinon.stub()
        };
        $state = {
            is: sinon.stub(),
            go: sinon.stub()
        };

        state = new State();

        createController = function () {
            controller = $controller('ApplicationController', {
                $stateParams: {appId: APP_ID},
                $scope: $scope,
                $state: $state,
                ApplicationStateClient: applicationStateClient,
                ApplicationResource: applicationResource,
                ServiceInstancesResource: serviceInstancesResource,
                NotificationService: notificationService
            });
        };

    }));

    it('should not be null', function () {
        createController();
        expect(controller).not.to.be.null;
    });

    it('init, set state pending and request for the application', function () {
        createController();

        expect($scope.state.value, 'state').to.be.equal(state.values.PENDING);
        expect(applicationResource.getApplication, 'called').to.be.called;
        expect(applicationResource.getApplication, 'called with').to.be.calledWith(APP_ID);
    });

    it('getApplication error 404, go to applications list', function () {
        applicationResource.getApplication = sinon.stub().returns(failedPromise({ status: 404 }));

        createController();
        $scope.$digest();

        expect($state.go).to.be.calledWith('app.applications');
        expect(notificationService.error).to.be.called;
    });

    it('getApplication error unknown, set state error', function () {
        applicationResource.getApplication = sinon.stub().returns(failedPromise({ status: 500 }));

        createController();
        $scope.$digest();

        expect($scope.state.value, 'state').to.be.equal(state.values.ERROR);
        expect(notificationService.genericError).to.be.called;
    });

    it('getApplication success, set application', function () {
        createAndInitializeController(SAMPLE_APP);

        expect($scope.appId, 'appId').to.be.deep.equal(SAMPLE_APP.guid);
        expect($scope.state.value, 'state').to.be.equal(state.values.LOADED);
    });

    it('restage, set restage status', function(){
        createAndInitializeController(SAMPLE_APP);

        $scope.restage();

        expect(applicationStateClient.restartApplication).to.be.calledWith(APP_ID);
    });

    it('delete, not confirmed, do not delete application resource', function(){
        createAndInitializeController();

        $scope.delete();
        $scope.$digest();

        expect(applicationResource.deleteApplication).not.to.be.called;
    });

    it('delete, confirmed, delete application resource', function(){
        notificationService.confirm = sinon.stub().returns(successPromise());
        createAndInitializeController();

        $scope.delete();
        $scope.$digest();

        expect(applicationResource.deleteApplication).to.be.calledWith(APP_ID);
    });

    it('delete, delete application success, go to apps list', function(){
        notificationService.confirm = sinon.stub().returns(successPromise());
        applicationResource.deleteApplication = sinon.stub().returns(successPromise());
        createAndInitializeController();

        $scope.delete();
        $scope.$digest();

        expect($state.go).to.be.calledWith('app.applications');
        expect(notificationService.success).to.be.called;
    });

    it('delete, delete application failure, stay on the same page', function(){
        notificationService.confirm = sinon.stub().returns(successPromise());
        applicationResource.deleteApplication = sinon.stub().returns(failedPromise());
        createAndInitializeController();

        $scope.delete();
        $scope.$digest();

        expect($state.go).not.to.be.called;
        expect(notificationService.success).not.to.be.called;
        expect($scope.state.isLoaded(), 'loaded').to.be.true;
    });

    it('start, use client to start app', function(){
        createAndInitializeController(SAMPLE_APP);

        $scope.start();
        $scope.$digest();

        expect(applicationStateClient.startApplication).to.be.calledWith(APP_ID);
    });

    it('start, success, reload application', function(){
        applicationStateClient.startApplication = sinon.stub().returns(successPromise());
        createAndInitializeController(SAMPLE_APP);

        $scope.start();
        $scope.$digest();

        expect(applicationResource.getApplication).to.be.calledTwice;
    });

    it('start, failure, do not reload application', function(){
        applicationStateClient.startApplication = sinon.stub().returns(failedPromise());
        createAndInitializeController(SAMPLE_APP);

        $scope.start();
        $scope.$digest();

        expect(applicationResource.getApplication).to.be.calledOnce;
    });

    it('stop, use client to stop app', function(){
        createAndInitializeController(SAMPLE_APP);

        $scope.stop();
        $scope.$digest();

        expect(applicationStateClient.stopApplication).to.be.calledWith(APP_ID);
    });

    it('stop, success, reload application', function(){
        applicationStateClient.stopApplication = sinon.stub().returns(successPromise());
        createAndInitializeController(SAMPLE_APP);

        $scope.stop();
        $scope.$digest();

        expect(applicationResource.getApplication).to.be.calledTwice;
    });

    it('stop, failure, do not reload application', function(){
        applicationStateClient.stopApplication = sinon.stub().returns(failedPromise());
        createAndInitializeController(SAMPLE_APP);

        $scope.stop();
        $scope.$digest();

        expect(applicationResource.getApplication).to.be.calledOnce;
    });

    it('restart, use client to restart app', function(){
        createAndInitializeController(SAMPLE_APP);

        $scope.restage();
        $scope.$digest();

        expect(applicationStateClient.restartApplication).to.be.calledWith(APP_ID);
    });

    it('restart, success, reload application', function(){
        applicationStateClient.restartApplication = sinon.stub().returns(successPromise());
        createAndInitializeController(SAMPLE_APP);

        $scope.restage();
        $scope.$digest();

        expect(applicationResource.getApplication).to.be.calledTwice;
    });

    it('restart, failure, do not reload application', function(){
        applicationStateClient.restartApplication = sinon.stub().returns(failedPromise());
        createAndInitializeController(SAMPLE_APP);

        $scope.restage();
        $scope.$digest();

        expect(applicationResource.getApplication).to.be.calledOnce;
    });

    function getSampleInstances() {
        return [
            {
                guid: 'i1',
                bound_apps: []
            },
            {
                guid: 'i2',
                bound_apps: [
                    {guid: APP_ID}
                ]
            },
            {
                guid: 'i3',
                bound_apps: [
                    {guid: 'a2'},
                    {guid: APP_ID}
                ]
            }
        ];
    }

    function createAndInitializeController(application, instances) {
        var application = application || SAMPLE_APP;
        var instances = instances || getSampleInstances();

        var deferred = $q.defer();
        applicationResource.getApplication = sinon.stub().returns(deferred.promise);
        deferred.resolve(application);

        var deferredInstances = $q.defer();
        serviceInstancesResource.getAll = sinon.stub().returns(deferredInstances.promise);
        deferredInstances.resolve(instances);

        createController();
        $scope.$digest();
    }

    function successPromise(param) {
        var deferred = $q.defer();
        deferred.resolve(param);
        return deferred.promise;
    }

    function failedPromise(param) {
        var deferred = $q.defer();
        deferred.reject(param);
        return deferred.promise;
    }

});