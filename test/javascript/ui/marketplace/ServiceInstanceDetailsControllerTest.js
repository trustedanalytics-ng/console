/**
 * Copyright (c) 2016 Intel Corporation
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

describe("Unit: ServiceInstanceDetailsControllerTest", function () {
    var controller,
        rootScope,
        scope,
        state,
        toolsState,
        deleteState,
        $q,
        $state,
        serviceInstanceResource,
        toolsInstanceResource,
        notificationService,
        createController,
        serviceInstanceDeferred,
        toolsInstanceDeferred,
        deleteInstanceDeferred,
        redirect = 'app.marketplace.instances';

    var SAMPLE_INSTANCE;

    beforeEach(module('app'));

    beforeEach(function() {
        SAMPLE_INSTANCE = {
            id: 'sample-guid',
            auditTrail: {
                createdOn: 123
            }
        };
    });

    beforeEach(inject(function ($controller, $rootScope, _$q_, State) {
        rootScope = $rootScope;
        scope = rootScope.$new();
        $q = _$q_;
        state = new State();
        deleteState = new State();
        toolsState = new State();
        serviceInstanceDeferred = $q.defer();
        toolsInstanceDeferred = $q.defer();
        deleteInstanceDeferred = $q.defer();

        $state = {
            go: sinon.stub()
        };

        serviceInstanceResource = {
            supressGenericError: sinon.stub().returnsThis(),
            getById: sinon.stub().returns(serviceInstanceDeferred.promise),
            deleteInstance: sinon.stub().returns(deleteInstanceDeferred.promise)
        };

        notificationService = {
            success: sinon.stub(),
            confirm: sinon.stub().returns($q.defer().promise),
            genericError: sinon.stub(),
            error: sinon.stub()
        };

        toolsInstanceResource = {
            getServiceInstance: sinon.stub().returns(toolsInstanceDeferred.promise)
        };

        createController = function () {
            controller = $controller('ServiceInstanceDetailsController', {
                $scope: scope,
                NotificationService: notificationService,
                ServiceInstancesResource: serviceInstanceResource,
                ToolsInstanceResource: toolsInstanceResource,
                $state: $state
            });
        };

        createController();
    }));

    it('should not be null', function () {
        expect(controller).not.to.be.null;
    });

    it('init, set state pending', function () {
        expect(scope.state.value).to.be.equals(state.values.PENDING);
        expect(scope.toolsState.value).to.be.equals(toolsState.values.PENDING);
        expect(scope.deleteState.value).to.be.equals(deleteState.values.DEFAULT);
    });

    it('init, getById called', function () {
        expect(serviceInstanceResource.getById).to.be.called;
    });

    it('init, getById success, instance loaded', function () {
        serviceInstanceDeferred.resolve(SAMPLE_INSTANCE);
        scope.$digest();

        expect(scope.state.value).to.be.equal(state.values.LOADED);
        expect(scope.serviceInstance.id).to.be.equal(SAMPLE_INSTANCE.id);
        expect(scope.serviceInstance.auditTrail.createdOnMilisec).to.be.equal(123000);
    });

    it('init, getById  404 error, redirect to instances page', function () {
        serviceInstanceDeferred.reject({status: 404});
        scope.$digest();
        expect($state.go).to.be.calledWith(redirect);
    });

    it('init, getById other than 404 error, set state on error', function () {
        serviceInstanceDeferred.reject({status: 500, data: {message: 'error message'}});
        scope.$digest();
        expect(scope.state.value).to.be.equals(state.values.ERROR);
        expect(notificationService.error).to.be.called;
    });

    it('deleteInstance, invoke, set deleteState on pending', function () {
        scope.delete();
        scope.$digest();
        expect(scope.deleteState.value).to.be.equals(deleteState.values.PENDING);
    });

    it('deleteInstance, success, redirect to instances page', function () {
        deleteInstanceDeferred.resolve();
        scope.delete();
        scope.$digest();
        expect(notificationService.success).to.be.called;
        expect($state.go).to.be.calledWith(redirect);
    });

    it('deleteInstance, reject, do not show success message', function () {
        deleteInstanceDeferred.reject({status: 500});
        scope.delete();
        scope.$digest();
        expect(notificationService.success).not.to.be.called;
    });

});
