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

describe("Unit: ModelsDetailsController", function() {

    var controller,
        createController,
        scope,
        modelResource,
        modelDetailsDeferred,
        deleteModelDeffered,
        modelUpdateDeferred,
        notificationService,
        state,
        $state,
        $q,
        modelsMock,
        redirect = 'app.modelcatalog.models';

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, $rootScope, _$q_, State, ModelsMock, _$stateParams_, _$state_) {
        modelsMock = ModelsMock;
        scope = $rootScope.$new();
        $state = _$state_;
        $q = _$q_;
        state = new State();
        deleteState = new State();
        $stateParams = _$stateParams_;
        modelDetailsDeferred = $q.defer();
        modelUpdateDeferred = $q.defer();
        deleteModelDeffered = $q.defer();

        modelResource = {
            getModelMetadata: sinon.stub().returns(modelDetailsDeferred.promise),
            updateModelMetadata: sinon.stub().returns(modelUpdateDeferred.promise),
            deleteModel: sinon.stub().returns(deleteModelDeffered.promise),
            withErrorMessage: sinon.stub().returnsThis()
        };

        notificationService = {
            success: function () {},
            withErrorMessage: function () {},
            error: function () {}
        };

        createController = function () {
            controller = $controller('ModelsDetailsController', {
                $scope: scope,
                ModelResource: modelResource,
                NotificationService: notificationService,
                $stateParams: $stateParams,
                $state: $state
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
        createController();
        expect(controller).not.to.be.null;
    });

    it('init, set state pending and deleteState default', function () {
        createController();
        expect(scope.state.value).to.be.equals(state.values.PENDING);
        expect(scope.deleteState.value).to.be.equals(state.values.DEFAULT);
    });

    it('init, getModelMetadata called', function () {
        createController();
        expect(modelResource.getModelMetadata).to.be.called;
    });

    it('init, getModelMetadata success, set state on loaded', function () {
        createController();
        modelDetailsDeferred.resolve();
        scope.$digest();
        expect(scope.state.value).to.be.equals(state.values.LOADED);
    });

    it('init, getModelMetadata 404 error, redirect to models', function () {
        var deferred = $q.defer();
        var spy = sinon.spy($state, 'go');
        modelResource.getModelMetadata = sinon.stub().returns(deferred.promise);
        deferred.reject({status: 404, data: {message: 'Model not found'}});
        createController();
        scope.$digest();
        expect(spy.calledWith(redirect)).to.be.true;

    });

    it('init, getModelMetadata other than 404 error, set state on error', function () {
        var errorSpied = sinon.spy(notificationService, 'error');
        modelDetailsDeferred.reject({status: 500, data: {message: 'error message'}});
        createController();
        scope.$digest();
        expect(scope.state.value).to.be.equals(state.values.ERROR);
        expect(errorSpied.called).to.be.true;
    });

    it('deleteModel, invoke, set deleteState on pending', function () {
        createController();
        scope.deleteModel();
        scope.$digest();
        expect(scope.deleteState.value).to.be.equals(deleteState.values.PENDING);
    });

    it('deleteModel, success, redirect to models, set deleteState to default', function () {
        var successSpied = sinon.spy(notificationService, 'success');
        var redirectSpied = sinon.spy($state, 'go');
        createController();
        deleteModelDeffered.resolve();
        scope.deleteModel();
        scope.$digest();
        expect(successSpied.called).to.be.true;
        expect(redirectSpied.calledWith(redirect)).to.be.true;
        expect(scope.deleteState.value).to.be.equals(deleteState.values.DEFAULT);
    });

    it('deleteModel, delete failed , do not notify about success, set deleteState to default', function () {
        var successSpied = sinon.spy(notificationService, 'success');
        var redirectSpied = sinon.spy($state, 'go');
        createController();
        deleteModelDeffered.reject({status: 404});
        scope.deleteModel();
        scope.$digest();
        expect(successSpied).not.to.be.called;
        expect(redirectSpied).not.to.be.called;
        expect(scope.deleteState.value).to.be.equals(deleteState.values.DEFAULT);
    });

    it('updateModelName, model name not changed, don\'t call updateModelMetadata method', function () {
        createController();
        scope.model = modelsMock[0];
        scope.updateModelName('name');
        expect(modelResource.updateModelMetadata.called).to.be.false;
    });

    it('updateModelName, model name changed, call updateModelMetadata method', function () {
        createController();
        scope.model = modelsMock[0];
        scope.updateModelName('not-name');
        expect(modelResource.updateModelMetadata.called).to.be.true;
    });
});
