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
describe("Unit: ServiceInstancesController", function () {

    var controller,
        createController,
        _targetProvider,
        serviceInstancesMock,
        SERVICE_ID = 'qweqwe',
        $rootScope,
        $q,
        scope,
        notificationService,
        organization = { guid: 111, name: "org" },
        space = { guid: 222, name: "space" };

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, TestHelpers, _$rootScope_, _$q_,
                                ServiceInstancesResource) {
        serviceInstancesMock = ServiceInstancesResource;

        _targetProvider = new TestHelpers().stubTargetProvider();
        $q = _$q_;
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();

        notificationService = {
            success: function(){},
            genericError: function(){}
        };

        _targetProvider.organization = organization;
        _targetProvider.space = space;

        createController = function() {
            controller = $controller('ServiceInstancesController', {
                $routeParams: { id: SERVICE_ID },
                $scope: scope,
                targetProvider: _targetProvider,
                NotificationService: notificationService,
                ServiceInstancesResource: serviceInstancesMock
            });
        };
    }));

    it('should not be null', function () {
        expect(controller).not.to.be.null;
    });

    it('init, got instances, set instances and state loaded', function () {
        var instances = getServiceInstances();
        var deferred = $q.defer();
        serviceInstancesMock.getAllByType = sinon.stub().returns(deferred.promise);
        createController();

        deferred.resolve(instances);
        $rootScope.$digest();

        expect(controller.instances).to.be.deep.equal(instances);
        expect(controller.state.isLoaded(), 'loaded').to.be.true;
    });

    it('init, got instances error, set status error', function () {
        var deferred = $q.defer();
        serviceInstancesMock.getAllByType = sinon.stub().returns(deferred.promise);

        createController();
        deferred.reject();
        $rootScope.$digest();
        expect(controller.state.value).to.be.equal(controller.state.values.ERROR);
    });

    it('on targetChanged, get instances second time', function () {
        var deferred = $q.defer();
        serviceInstancesMock.getAllByType = sinon.stub().returns(deferred.promise);
        createController();
        deferred.resolve();
        $rootScope.$broadcast('targetChanged');
        $rootScope.$digest();
        expect(serviceInstancesMock.getAllByType.called).to.be.true;
    });

    it('on instanceCreated, get instances second time', function () {
        var deferred = $q.defer();
        serviceInstancesMock.getAllByType = sinon.stub().returns(deferred.promise);
        createController();
        deferred.resolve();
        scope.$emit('instanceCreated');
        $rootScope.$digest();
        expect(serviceInstancesMock.getAllByType.called).to.be.true;
    });

    function getServiceInstances() {
        return [
            {"guid":"3a4eb3e4-2654-4b47-8430-3f808ad171e0","name":"test1","service_plan":"shared","bounded_apps":0,
                last_operation: {state: "succeded"}, serviceName: "sample-name"},
            {"guid":"36d4d970-bbcf-456e-ac35-f00b81a33f16","name":"security-codes-db","service_plan":"free","bounded_apps":2,
                last_operation: {state: "succeded"}, serviceName: "sample-name"},
            {"guid":"68ec22a2-56fe-4aa9-b591-9c694f194721","name":"pancho-kafka","service_plan":"shared","bounded_apps":3,
                last_operation: {state: "succeded"}, serviceName: "sample-name"}
        ];
    }
});
