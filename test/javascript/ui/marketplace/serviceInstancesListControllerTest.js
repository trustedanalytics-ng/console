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
describe("Unit: ServiceInstancesListController", function () {

    var sut,
        scope,
        targetProvider = {},
        ServiceInstancesListHelper = {},
        UserProvider,
        KubernetesServicesResource,
        NotificationService = {},
        state,
        $q,
        space = Object.freeze({
            guid: 'space-0123'
        }),

        createController;

    beforeEach(module('app:core'));

    beforeEach(inject(function($controller, $rootScope, State, _$q_) {
        $q = _$q_;
        state = new State();
        targetProvider.getSpace = sinon.stub().returns(space);
        targetProvider.getOrganization = sinon.stub().returns({});

        ServiceInstancesListHelper.refreshContent = sinon.stub().returns($q.defer().promise);
        UserProvider = {
            isAdmin: sinon.stub().returns(getResolvedPromise("USER"))
        };

        KubernetesServicesResource = {
            withErrorMessage: sinon.stub().returnsThis(),
            services: sinon.stub().returns($q.defer().promise),
            setVisibility: sinon.stub().returns($q.defer().promise)
        };

        NotificationService.error =  sinon.stub();
        NotificationService.success = sinon.stub();
        NotificationService.confirm = sinon.stub().returns($q.defer().promise);

        createController = function() {
            scope = $rootScope.$new();
            sut = $controller('ServiceInstancesListController', {
                $scope: scope,
                State: State,
                targetProvider: targetProvider,
                ServiceInstancesListHelper: ServiceInstancesListHelper,
                NotificationService: NotificationService
            });
            scope.$apply();
        };
    }));

    it('init, set state pending and get instances', function() {
        createController();

        expect(scope.state.isPending(), 'pending').to.be.true;
        expect(ServiceInstancesListHelper.refreshContent).to.be.called;
    });

    it('targetChanged, set state pending and get instances again', function() {
        createController();

        scope.$emit('targetChanged');

        expect(scope.state.isPending(), 'pending').to.be.true;
        expect(ServiceInstancesListHelper.refreshContent).to.be.calledTwice;
    });


    it('get instances success, refresh content and set state loaded', function() {
        var services = getServices();
        ServiceInstancesListHelper.refreshContent = sinon.stub().returns(getResolvedPromise(services));

        createController();

        expect(ServiceInstancesListHelper.refreshContent).to.be.called;
        expect(scope.state.isLoaded(), 'loaded').to.be.true;
    });


    it('get instances error, set state loaded', function() {
        ServiceInstancesListHelper.refreshContent = sinon.stub().returns(getRejectedPromise());

        createController();
        scope.$apply();

        expect(ServiceInstancesListHelper.refreshContent).to.be.called;
        expect(scope.state.isLoaded(), 'loaded').to.be.true;
    });



    function getServices() {
        return [
            {
                guid: 's1',
                label: 'service1',
                tags: [
                    't1', 't2', 't3'
                ],
                extra: '{"label":"service1-extra","tags":["t1-extra","t2-extra"],"like":"bananas"}',
                instances: [{
                    guid: 'i1',
                    name: 'inst1',
                    service_guid: 's1',
                    service_plan: {
                        name: 'free'
                    },
                    last_operation: {state: "succeeded"}
                }]
            }, {
                guid: 's2',
                label: 'service2',
                tags: [
                    't1', 't2', 't3'
                ],
                extra: '{"label":"service1-extra","tags":["t1-extra","t2-extra"],"like":"bananas"}',
                instances: [{
                    guid: 'i1',
                    name: 'inst1',
                    service_guid: 's1',
                    service_plan: {
                        name: 'free'
                    },
                    last_operation: {state: "succeeded"}
                }]
            }, {
                label: 'service3',
                tags: []
            }
        ];
    }

    function getResolvedPromise(data) {
        var deferred = $q.defer();
        deferred.resolve(data);
        return deferred.promise;
    }
    
    function getRejectedPromise(data) {
        var deferred = $q.defer();
        deferred.reject(data);
        return deferred.promise;
    }

});