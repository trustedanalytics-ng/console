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

describe("Unit: ModelsController", function() {

    var controller,
        scope,
        ModelResource,
        h2oPublisherResource,
        targetProvider,
        notificationService,
        state,
        $q,
        modelsMock,
        deferred;

    beforeEach(module('app'));

    beforeEach(module(function($provide){
        $provide.value('targetProvider', targetProvider);
    }));

    beforeEach(inject(function ($controller, $rootScope, _$q_, State, ModelsMock) {
        modelsMock = ModelsMock;
        scope = $rootScope.$new();
        $q = _$q_;
        state = new State();
        deferred = $q.defer();

        targetProvider = {
            getOrganization: sinon.stub().returns({ guid: 'o1' })
        };

        createController = function () {
            controller = $controller('ModelsController', {
                $scope: scope,
                targetProvider: targetProvider,
                ModelResource: ModelResource,
                H2OPublisherResource: h2oPublisherResource,
                NotificationService: notificationService
            });
        };

        ModelResource = {
            getModels: sinon.stub().returns(deferred.promise)
        };

        h2oPublisherResource = {
            withErrorMessage: function () {
                return this;
            },
            postDataModel: sinon.stub().returns($q.defer().promise)
        };

        notificationService = {
            success: function() {}
        };

    }));

    it('should not be null', function () {
        createController();
        expect(controller).not.to.be.null;
    });

    it('init, set pending and get instances', function () {
        createController();
        expect(scope.state.isPending(), 'pending').to.be.true;
        expect(ModelResource.getModels).to.be.called;
    });

    it('init, getInstances, set defaultFilter on success', function () {
        var defaultFilters = {
            selectedType: 'Choose Model Type',
            created: {}
        };
        createController();
        deferred.resolve();
        scope.$digest();
        expect(scope.filters).to.be.deep.equal(defaultFilters);
    });

    it('targetChanged, get instances', function () {
        createController();

        scope.$emit('targetChanged');

        expect(ModelResource.getModels).to.be.calledTwice;
    });

    it('searchChanged, set pagination page to 1', function () {
        createController();
        var spy = sinon.spy(scope.tableParams, 'page');
        scope.$emit('searchChanged');
        expect(spy.calledWith(1)).to.be.true;
    });
});