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
describe("Unit: ApplicationBindingsController", function () {

    var controller,
        createController,
        serviceInstancesResource,
        applicationResource,
        _state,
        notificationService,
        $rootScope,
        $scope,
        $q,
        SAMPLE_APPLICATION = Object.freeze({ guid: 'a1', space_guid: 's1' }),
        SAMPLE_BINDINGS = [
            {entity: {app_guid:'a1', service_instance_guid: 'i2'}},
            {entity: {app_guid:'a1', service_instance_guid: 'i3'}},
            {entity: {app_guid:'a1', service_instance_guid: 'i4'}}
        ],
        SAMPLE_INSTANCES = [{id:'i1'},{id:'i2'},{id:'i3'}];

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, _$rootScope_, State, $stateParams, _$q_) {
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $q =_$q_;

        serviceInstancesResource = {
            getAll: sinon.stub()
        };
        applicationResource = {
            withErrorMessage: sinon.stub().returnsThis(),
            getBindings: sinon.stub().returns($q.defer().promise),
            bindService: sinon.stub().returns($q.defer().promise),
            unbindService: sinon.stub().returns($q.defer().promise)
        };
        _state = new State();
        notificationService = {
            success: sinon.stub(),
            error: sinon.stub()
        };
        $stateParams.appId = SAMPLE_APPLICATION.guid;

        createController = function () {
            controller = $controller('ApplicationBindingsController', {
                $scope: $scope,
                NotificationService: notificationService,
                ApplicationResource: applicationResource,
                ServiceInstancesResource: serviceInstancesResource
            });
        };

    }));

    it('should not be null', function () {
        expect(controller).not.to.be.null;
    });

    it('init, set state pending and request for bindings', function () {
        createController();

        expect($scope.state.value, 'state').to.be.equal(_state.values.PENDING);
        expect(applicationResource.getBindings.calledWith(SAMPLE_APPLICATION.guid)).to.be.true;
    });

    it('get bindings success, set bindings', function () {
        applicationResource.getBindings = sinon.stub().returns(successfulPromise(SAMPLE_BINDINGS));

        createController();
        $rootScope.$digest();

        expect($scope.state.value, 'state').to.be.equal(_state.values.PENDING);
        expect($scope.bindings).to.be.deep.equal(SAMPLE_BINDINGS);

    });

    it('get bindings error, set error', function () {
        applicationResource.getBindings = sinon.stub().returns(rejectedPromise());

        createController();
        $rootScope.$digest();

        expect($scope.state.value, 'state').to.be.equal(_state.values.ERROR);
    });

    it('setApplication, set application', function () {
        createController();

        $scope.setApplication(SAMPLE_APPLICATION);

        expect($scope.application, 'application').to.be.deep.equal(SAMPLE_APPLICATION);
    });

    it('setInstances, set services', function () {
        createController();

        $scope.setInstances(SAMPLE_INSTANCES);

        expect($scope.services).to.be.deep.equal(SAMPLE_INSTANCES);
    });

    it('setApplication, got application, bindings and services, set status loaded', function () {
        applicationResource.getBindings = sinon.stub().returns(successfulPromise(SAMPLE_BINDINGS));

        createController();
        $scope.setApplication(SAMPLE_APPLICATION);
        $scope.setInstances(SAMPLE_INSTANCES);

        $rootScope.$digest();

        expect($scope.state.value, 'state').to.be.equal(_state.values.LOADED);
        expect($scope.servicesBound, 'bound services').to.be.deep.equal([ SAMPLE_INSTANCES[1], SAMPLE_INSTANCES[2] ]);
        expect($scope.servicesAvailable, 'available services').to.be.deep.equal([ SAMPLE_INSTANCES[0] ]);
    });

    it('bindService, no application set do not create binding', function () {
        createController();
        $scope.bindService({ id: 's1' });

        expect(applicationResource.bindService).not.to.be.called;
    });

    it('bindService, create binding and set status pending', function () {
        var service = { id: 's1' };

        applicationResource.getBindings = sinon.stub().returns(successfulPromise(SAMPLE_BINDINGS));
        applicationResource.bindService = sinon.stub().returns(successfulPromise());

        createController();
        $scope.setApplication(SAMPLE_APPLICATION);

        $scope.bindService(service);
        $rootScope.$digest();

        expect($scope.state.value, 'state').to.be.equal(_state.values.PENDING);
        expect(applicationResource.bindService).to.be.calledWith(SAMPLE_APPLICATION.guid, service.id);
    });

    it('bindService success, request bindings', function () {
        applicationResource.getBindings = sinon.stub().returns(successfulPromise(SAMPLE_BINDINGS));
        applicationResource.bindService = sinon.stub().returns(successfulPromise());

        createController();

        $scope.setApplication(SAMPLE_APPLICATION);
        $scope.bindService({ id: 's1' });
        $rootScope.$digest();

        expect(applicationResource.getBindings.called).to.be.true;
    });

    it('unbindService, no application set do not delete binding', function () {
        applicationResource.getBindings = sinon.stub().returns(successfulPromise(SAMPLE_BINDINGS));
        createController();

        $scope.unbindService({ id: 'i1' });

        expect(applicationResource.unbindService).not.to.be.called;
    });

    it('unbindService, delete binding set status pending', function () {
        applicationResource.getBindings = sinon.stub().returns(successfulPromise(SAMPLE_BINDINGS));

        createController();

        $scope.setApplication(SAMPLE_APPLICATION);
        $scope.setInstances(SAMPLE_INSTANCES);
        $scope.state.value = _state.values.LOADED;

        $scope.unbindService({ id: 's1' });

        expect($scope.state.value, 'state').to.be.equal(_state.values.PENDING);
    });

    it('unbindService success, get bindings', function () {
        applicationResource.getBindings = sinon.stub().returns(successfulPromise(SAMPLE_BINDINGS));
        applicationResource.unbindService = sinon.stub().returns(successfulPromise());

        createController();

        $scope.setApplication(SAMPLE_APPLICATION);

        $scope.unbindService({id : 's1'});
        $rootScope.$digest();

        expect(applicationResource.unbindService).to.be.called;
        expect(applicationResource.getBindings).to.be.calledTwice;
    });

    it('unbindService error, set status error', function () {
        applicationResource.getBindings = sinon.stub().returns(successfulPromise(SAMPLE_BINDINGS));
        applicationResource.unbindService = sinon.stub().returns(rejectedPromise());

        createController();

        $scope.setApplication(SAMPLE_APPLICATION);
        $scope.setInstances(SAMPLE_INSTANCES);

        $scope.unbindService({ id: 's1' });

        $rootScope.$digest();

        expect(notificationService.success).not.to.be.called;
    });

    function successfulPromise(data) {
        var deferred = $q.defer();
        deferred.resolve(data);
        return deferred.promise;
    }

    function rejectedPromise(data) {
        var deferred = $q.defer();
        deferred.reject(data);
        return deferred.promise;
    }

});
