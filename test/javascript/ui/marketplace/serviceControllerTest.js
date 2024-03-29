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
describe("Unit: ServiceController", function () {

    var controller,
        createController,
        _targetProvider,
        offeringsMock,
        serviceInstanceMock,
        SERVICE_ID = 'qweqwe',
        getServiceDefer,
        saveInstanceDefer,
        offering = {offeringPlans: ['plan-a', 'plan-b']},
        $rootScope,
        $q,
        location,
        scope,
        organization = { guid: 111, name: "org" },
        space = { guid: 222, name: "space" },
        state;

    beforeEach(module('app:core'));

    var notificationService;

    beforeEach(inject(function ($controller, _$rootScope_, _$q_, TestHelpers, State) {
        _targetProvider = new TestHelpers().stubTargetProvider();
        state = new State();
        $rootScope = _$rootScope_;
        $q = _$q_;
        scope = $rootScope.$new();

        scope.offeringId = SERVICE_ID;

        getServiceDefer = $q.defer();

        offeringsMock = {
            getOffering: sinon.stub().returns(getServiceDefer.promise),
            withErrorMessage: sinon.stub().returnsThis()
        };


        saveInstanceDefer = $q.defer();
        serviceInstanceMock = {
            createInstance: sinon.stub().returns(saveInstanceDefer.promise)
        };

        notificationService = {
            genericError: sinon.stub(),
            success: sinon.stub()
        };

        location = {
            path: sinon.stub()
        };

        _targetProvider.organization = organization;
        _targetProvider.space = space;

        createController = function() {
            controller = $controller('ServiceController', {
                NotificationService: notificationService,
                OfferingsResource: offeringsMock,
                ServiceInstancesResource: serviceInstanceMock,
                $scope: scope,
                targetProvider: _targetProvider,
                ngDialog: {},
                $location: location,
                $stateParams: {}
            });
        };
    }));

    it('should not be null', function () {
        createController();
        expect(controller).not.to.be.null;
    });

    it('init, get service and set state pending', function () {
        createController();

        expect(offeringsMock.getOffering).to.be.called;
        expect(controller.state.value).to.be.equals(state.values.PENDING);
    });

    it('init, got service, set state loaded', function () {
        createController();
        getServiceDefer.resolve(_.extend({deletable: true}, offering));
        $rootScope.$digest();

        expect(controller.state.value).to.be.equals(state.values.LOADED);
    });

    it('init, got not found, set state not found', function () {
        createController();
        getServiceDefer.reject(404);
        $rootScope.$digest();
        expect(controller.state.value).to.be.equals(state.values.NOT_FOUND);
    });

    it('init, got unknown error, set state error', function () {
        createController();
        getServiceDefer.reject(500);
        $rootScope.$digest();

        expect(controller.state.value).to.be.equals(state.values.ERROR);
    });

    it('init, got service, select first plan', function () {
        createController();
        getServiceDefer.resolve(_.extend({deletable: true}, offering));
        $rootScope.$digest();
        expect(controller.selectedPlan).to.be.equals(offering.offeringPlans[0]);
    });

    it('createServiceInstance, save ServiceInstance resource and set state pending', function () {
        createController();
        controller.newInstance = {};

        controller.createServiceInstance({});
        saveInstanceDefer.resolve();

        expect(serviceInstanceMock.createInstance.called).to.be.true;
        expect(controller.newInstanceState.value).to.be.equals(state.values.PENDING);
    });

    it('createServiceInstance, success, set status loaded and refresh space summary', function () {
        createController();
        var emitSpied = sinon.spy(scope, '$broadcast');
        controller.newInstance = {};
        controller.createServiceInstance({});

        saveInstanceDefer.resolve();
        $rootScope.$digest();

        expect(controller.newInstanceState.value).to.be.equals(state.values.DEFAULT);
        expect(emitSpied.calledWith('instanceCreated')).to.be.true;
    });

    it('createServiceInstance, error, set status error', function () {
        createController();
        controller.service = {name: 'notAtk'};
        controller.newInstance = {};
        controller.createServiceInstance({});

        saveInstanceDefer.reject({status: 500});
        $rootScope.$digest();
        expect(controller.newInstanceState.value).to.be.equals(state.values.ERROR);
    });

    it('tryDeleteOffering, confirm, delete service', function () {
        createController();
        notificationService.confirm = sinon.stub().returns(successPromise());
        offeringsMock.deleteOffering = sinon.stub().returns($q.defer().promise);
        controller.offeringId = 'service-id';

        controller.tryDeleteOffering();
        $rootScope.$digest();

        expect(controller.state.isPending(), 'pending').to.be.true;
        expect(offeringsMock.deleteOffering).to.be.called;
        expect(offeringsMock.deleteOffering).to.be.calledWith('service-id');
    });

    it('tryDeleteOffering, cancel, do not delete service', function () {
        createController();
        notificationService.confirm = sinon.stub().returns(rejectPromise());
        offeringsMock.deleteService = sinon.stub().returns($q.defer().promise);

        controller.tryDeleteOffering();
        $rootScope.$digest();

        expect(offeringsMock.deleteService).not.to.be.called;
    });

    it('tryDeleteOffering, deleted, show success and relocate page', function () {
        createController();
        notificationService.confirm = sinon.stub().returns(successPromise());
        offeringsMock.deleteOffering = sinon.stub().returns(successPromise());
        controller.offeringId = 'service-id';

        controller.tryDeleteOffering();
        $rootScope.$digest();

        expect(notificationService.success).to.be.called;
        expect(location.path).to.be.called;
    });

    it('tryDeleteOffering, delete failed, set state loaded', function () {
        createController();
        notificationService.confirm = sinon.stub().returns(successPromise());
        offeringsMock.deleteOffering = sinon.stub().returns(rejectPromise());

        controller.tryDeleteOffering();
        $rootScope.$digest();

        expect(notificationService.success).not.to.be.called;
        expect(location.path).not.to.be.called;
        expect(controller.state.isLoaded(), 'loaded').to.be.true;
    });

    it('addExtraParam, create one element array', function () {
        createController();

        controller.addExtraParam();

        expect(controller.newInstance.params).to.be.deep.equal([{key:null,value:null}]);
    });

    it('addExtraParam, twice, create two element array', function () {
        createController();

        controller.addExtraParam();
        controller.newInstance.params[0].key = "test";
        controller.newInstance.params[0].value = "banana";
        controller.addExtraParam();

        expect(controller.newInstance.params.length).to.equal(2);
        expect(controller.newInstance.params[0]).to.be.deep.equal({key:'test', value:'banana'});
        expect(controller.newInstance.params[1]).to.be.deep.equal({key:null, value:null});
    });

    function successPromise() {
        var deferred = $q.defer();
        deferred.resolve();
        return deferred.promise;
    }

    function rejectPromise() {
        var deferred = $q.defer();
        deferred.reject();
        return deferred.promise;
    }
});
