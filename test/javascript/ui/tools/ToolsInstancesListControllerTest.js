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
describe("Unit: ToolsInstanceListController", function () {

    var controller,
        createController,
        _targetProvider,
        serviceInstancesMock,
        serviceResourceMock,
        SERVICE_ID = 'qweqwe',
        $rootScope,
        locationMock,
        $q,
        scope,
        notificationService,
        organization = { guid: 111, name: "org" },
        SAMPLE_OFFERING = {
            id: 'offering-id',
            offeringPlans: [{
                id: 'offering-plan-id'
            }]
        };

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, $location, TestHelpers, _$rootScope_, _$q_) {
        $q = _$q_;
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();

        serviceInstancesMock = {
            withErrorMessage: sinon.stub().returnsThis(),
            supressGenericError: sinon.stub().returnsThis(),
            getAll: sinon.stub().returns($q.defer().promise),
            deleteInstance: sinon.stub().returns($q.defer().promise),
            createInstance: sinon.stub().returns($q.defer().promise)
        };
        serviceResourceMock = {
            withErrorMessage: sinon.stub().returnsThis(),
            getAll: sinon.stub().returns($q.defer().promise)
        };
        locationMock = $location;

        _targetProvider = new TestHelpers().stubTargetProvider();

        notificationService = {
            confirm: function() {},
            success: function(){},
            error: function(){},
            withErrorMessage: function() { return this; }
        };

        var state = {
            current: sinon.stub().returnsThis()
        };

        _targetProvider.organization = organization;

        createController = function() {
            controller = $controller('ToolsInstancesListController', {
                $routeParams: { id: SERVICE_ID },
                $scope: scope,
                $location: locationMock,
                targetProvider: _targetProvider,
                NotificationService: notificationService,
                ServiceInstancesResource: serviceInstancesMock,
                OfferingsResource: serviceResourceMock,
                $state: state
            });
        };
    }));

    beforeEach(inject(function($httpBackend) {
        // workaround for 'Unexpected request GER /rest/orgs' issued by router.
        $httpBackend.expectGET('/rest/orgs').respond(function () {
            return null;
        });
    }));

    it('should not be null', function () {
        expect(controller).not.to.be.null;
    });


    it('createInstance, create instance of service', function () {
        createController();
        scope.offering = SAMPLE_OFFERING;
        scope.createInstance('lala');

        expect(serviceInstancesMock.createInstance.called, 'createInstance called').to.be.true;
    });
});
