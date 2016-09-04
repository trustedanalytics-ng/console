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
        applicationHelper,
        state,
        $q,
        $scope,
        APP_ID = "app-guid",
        SAMPLE_APP = { guid: APP_ID };

    beforeEach(module('app'));

    beforeEach(inject(function(_$q_, $rootScope, $controller, State) {
        $q = _$q_;
        $scope = $rootScope.$new();

        applicationHelper = {
            startApplication: sinon.stub().returns($q.defer().promise),
            stopApplication: sinon.stub().returns($q.defer().promise),
            restartApplication: sinon.stub().returns($q.defer().promise),
            getApplication: sinon.stub().returns($q.defer().promise),
            deleteApplication: sinon.stub().returns($q.defer().promise)
        };

        state = new State();

        createController = function () {
            controller = $controller('ApplicationController', {
                $stateParams: {appId: APP_ID},
                $scope: $scope,
                ApplicationHelper: applicationHelper
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
        expect(applicationHelper.getApplication, 'called').to.be.called;
        expect(applicationHelper.getApplication, 'called with').to.be.calledWith(APP_ID);
    });

    it('getApplication error 404, set state error not found', function () {
        applicationHelper.getApplication = sinon.stub().returns(failedPromise({ status: 404 }));

        createController();
        $scope.$digest();

        expect($scope.state.value, 'state').to.be.equal(state.values.NOT_FOUND);
    });

    it('getApplication error unknown, set state error', function () {
        applicationHelper.getApplication = sinon.stub().returns(failedPromise({ status: 500 }));

        createController();
        $scope.$digest();

        expect($scope.state.value, 'state').to.be.equal(state.values.ERROR);
    });

    it('getApplication success, set application', function () {
        createAndInitializeController(SAMPLE_APP);

        expect($scope.application, 'application').to.be.deep.equal(SAMPLE_APP);
        expect($scope.state.value, 'state').to.be.equal(state.values.LOADED);
    });

    it('restage, set restage status', function(){
        createAndInitializeController(SAMPLE_APP);

        $scope.restage();

        expect(applicationHelper.restartApplication).to.be.calledWith(APP_ID);
    });

    it('delete, delete application resource', function(){
        applicationHelper.deleteApplication = sinon.stub().returns(successPromise());
        createAndInitializeController();

        $scope.delete();
        $scope.$digest();

        expect(applicationHelper.deleteApplication, 'deleteApplication').to.be.calledWith($scope.state, APP_ID);
    });

    it('start, notifications service called with success', function(){
        createAndInitializeController(SAMPLE_APP);

        $scope.start();

        expect(applicationHelper.startApplication).to.be.calledWith(APP_ID);
    });

    it('start, set error status if something crashes', function(){
        applicationHelper.start = sinon.stub().returns(failedPromise());
        createAndInitializeController(SAMPLE_APP);

        $scope.start();
        $scope.$digest();

        expect(applicationHelper.startApplication).to.be.calledWith(APP_ID);
    });

    it('stop, notifications service called with success', function(){
        applicationHelper.stop = sinon.stub().returns(successPromise());
        createAndInitializeController(SAMPLE_APP);

        $scope.stop();
        $scope.$digest();

        expect(applicationHelper.stopApplication).to.be.calledWith(APP_ID);
    });

    it('stop, set error status if something crashes', function(){
        applicationHelper.stop = sinon.stub().returns(failedPromise());
        createAndInitializeController(SAMPLE_APP);

        $scope.stop();
        $scope.$digest();

        expect(applicationHelper.stopApplication).to.be.calledWith(APP_ID);
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
        application = application || { guid: APP_ID };
        applicationHelper.getApplication = sinon.stub().returns(successPromise(application));

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