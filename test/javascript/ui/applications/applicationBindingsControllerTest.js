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
        serviceBindingResource,
        serviceUnbindingResource,
        bindingsResource,
        applicationResource,
        _state,
        notificationService,
        $rootScope,
        $scope,
        $q,
        SAMPLE_APPLICATION = Object.freeze({ guid: 'a1', space_guid: 's1' }),
        SAMPLE_BINDINGS = [
            {guid:'b1', app_guid:'a1', service_instance_guid: 'i2'},
            {guid:'b2', app_guid:'a1', service_instance_guid: 'i3'},
            {guid:'b3', app_guid:'a1', service_instance_guid: 'i4'}
        ],
        SAMPLE_INSTANCES = [{id:'i1'},{id:'i2'},{id:'i3'}];

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, _$rootScope_, ServiceInstancesResource,
                                ServiceBindingResource, ServiceUnbindingResource, BindingsResource, applicationBindingExtractor, State, $stateParams, ApplicationResource, _$q_) {
        serviceInstancesResource = ServiceInstancesResource;
        serviceBindingResource = ServiceBindingResource;
        serviceUnbindingResource = ServiceUnbindingResource;
        bindingsResource = BindingsResource;
        applicationResource = ApplicationResource;
        _state = new State();
        notificationService = {
            success: function(){},
            error: function(){}
        };
        $rootScope = _$rootScope_;
        $scope = $rootScope.$new();
        $q =_$q_;

        $stateParams.appId = SAMPLE_APPLICATION.guid;

        serviceInstancesResource.getAll = function () {
        };
        serviceBindingResource.createBinding = sinon.stub();
        serviceUnbindingResource.deleteBinding = function () {
        };
        applicationBindingExtractor.extract = function (v) {
            return v;
        };

        createController = function () {
            controller = $controller('ApplicationBindingsController', {
                $scope: $scope,
                NotificationService: notificationService
            });
        };

    }));

    it('should not be null', function () {
        expect(controller).not.to.be.null;
    });

    it('init, set state pending and request for bindings', function () {
        var deferred = $q.defer();
        bindingsResource.getAllBindings = sinon.stub().returns(deferred.promise);
        createController();

        expect($scope.state.value, 'state').to.be.equal(_state.values.PENDING);
        expect(bindingsResource.getAllBindings.calledWith(SAMPLE_APPLICATION.guid)).to.be.true;
    });

    it('get bindings success, set bindings', function () {
        var deferred = $q.defer();
        bindingsResource.getAllBindings = sinon.stub().returns(deferred.promise);
        deferred.resolve(SAMPLE_BINDINGS);

        createController();
        expect($scope.state.value, 'state').to.be.equal(_state.values.PENDING);
        $rootScope.$digest();
        expect($scope.bindings).to.be.deep.equal(SAMPLE_BINDINGS);

    });

    it('get bindings error, set error', function () {
        var deferred = $q.defer();
        bindingsResource.getAllBindings = sinon.stub().returns(deferred.promise);
        deferred.reject();

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
        var deferred = $q.defer();
        bindingsResource.getAllBindings = sinon.stub().returns(deferred.promise);
        deferred.resolve(SAMPLE_BINDINGS);

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
        $scope.bindService({ guid: 's1' });

        expect(serviceBindingResource.createBinding.called).to.be.false;
    });

    it('bindService, create binding and set status pending', function () {
        var service = { id: 's1' };

        var deferredAll = $q.defer();
        bindingsResource.getAllBindings = sinon.stub().returns(deferredAll.promise);
        deferredAll.resolve(SAMPLE_BINDINGS);

        var deferred = $q.defer();
        serviceBindingResource.createBinding = sinon.stub().returns(deferred.promise);
        deferred.resolve();

        createController();
        $scope.setApplication(SAMPLE_APPLICATION);

        $scope.bindService(service);
        $rootScope.$digest();
        expect($scope.state.value, 'state').to.be.equal(_state.values.PENDING);
        expect(serviceBindingResource.createBinding.calledWith(SAMPLE_APPLICATION.guid, service.id), 'called with args').to.be.true;
    });

    it('bindService success, request bindings', function () {
        var deferredAll = $q.defer();
        bindingsResource.getAllBindings = sinon.stub().returns(deferredAll.promise);
        deferredAll.resolve(SAMPLE_BINDINGS);

        var deferred = $q.defer();
        serviceBindingResource.createBinding = sinon.stub().returns(deferred.promise);
        deferred.resolve();

        createController();

        $scope.setApplication(SAMPLE_APPLICATION);
        $scope.bindService({ guid: 's1' });
        $rootScope.$digest();

        expect(bindingsResource.getAllBindings.called).to.be.true;
    });

    it('unbindService, no application set do not delete binding', function () {
        var deleteBindingSpied = sinon.spy(serviceUnbindingResource, 'deleteBinding');

        createController();
        $scope.bindings = getSampleBindings();

        $scope.unbindService({ guid: 'i1' });

        expect(deleteBindingSpied.called).to.be.false;
    });

    it('unbindService, delete binding set status pending', function () {
        $scope.bindings = getSampleBindings();
        var deferredAll = $q.defer();
        bindingsResource.getAllBindings = sinon.stub().returns(deferredAll.promise);
        deferredAll.resolve(SAMPLE_BINDINGS);

        var deferred = $q.defer();
        serviceUnbindingResource.deleteBinding = sinon.stub().returns(deferred.promise);
        deferred.resolve();

        createController();

        $scope.setApplication(SAMPLE_APPLICATION);
        $scope.setInstances(SAMPLE_INSTANCES);
        $scope.state.value = _state.values.LOADED;

        $scope.unbindService({ guid: 's1' });

        expect($scope.state.value, 'state').to.be.equal(_state.values.PENDING);
    });

    it('unbindService success, get bindings', function () {
        var deferredAll = $q.defer();
        bindingsResource.getAllBindings = sinon.stub().returns(deferredAll.promise);
        deferredAll.resolve(SAMPLE_BINDINGS);

        var deferred = $q.defer();
        serviceUnbindingResource.deleteBinding = sinon.stub().returns(deferred.promise);
        deferred.resolve();

        createController();

        $scope.bindings = getSampleBindings();

        $scope.setApplication(SAMPLE_APPLICATION);
        $scope.setInstances(SAMPLE_INSTANCES);


        $scope.unbindService({id : 's1'});
        expect($scope.state.value, 'state').to.be.equal(_state.values.PENDING);
        $rootScope.$digest();
        expect(serviceUnbindingResource.deleteBinding.called).to.be.true;
    });

    it('unbindService error, set status error', function () {

        var deferredAll = $q.defer();
        bindingsResource.getAllBindings = sinon.stub().returns(deferredAll.promise);
        deferredAll.resolve(SAMPLE_BINDINGS);

        var deferred = $q.defer();
        serviceUnbindingResource.deleteBinding = sinon.stub().returns(deferred.promise);
        deferred.reject();

        createController();

        $scope.bindings = getSampleBindings();
        $scope.setApplication(SAMPLE_APPLICATION);
        $scope.setInstances(SAMPLE_INSTANCES);

        var errorSpied = sinon.spy(notificationService, 'error');

        $scope.unbindService({ id: 's1' });

        $rootScope.$digest();

        expect(errorSpied.called, 'called').to.be.true;
    });

    function getSampleBindings() {
        return [
            {
                guid: 'b0',
                service_instance_guid: 's0'
            },
            {
                guid: 'b1',
                service_instance_guid: 's1'
            },
            {
                guid: 'b2',
                service_instance_guid: 's2'
            }
        ];
    }
});
