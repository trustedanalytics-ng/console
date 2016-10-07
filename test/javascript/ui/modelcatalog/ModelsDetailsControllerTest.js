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
        deleteModelArtifactDeffered,
        modelUpdateDeferred,
        confirmDeferred,
        notificationService,
        commonTableParams,
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
        deleteArtifactState = new State();
        $stateParams = _$stateParams_;
        modelDetailsDeferred = $q.defer();
        modelUpdateDeferred = $q.defer();
        deleteModelDeffered = $q.defer();
        deleteModelArtifactDeffered = $q.defer();
        confirmDeferred = $q.defer();

        modelResource = {
            getModelMetadata: sinon.stub().returns(modelDetailsDeferred.promise),
            updateModelMetadata: sinon.stub().returns(modelUpdateDeferred.promise),
            deleteModel: sinon.stub().returns(deleteModelDeffered.promise),
            deleteModelArtifact: sinon.stub().returns(deleteModelArtifactDeffered.promise),
            withErrorMessage: sinon.stub().returnsThis()
        };

        notificationService = {
            success: function () {},
            confirm: sinon.stub().returns(confirmDeferred.promise),
            withErrorMessage: function () {},
            error: function () {}
        };

        commonTableParams = {
            getTableParams: function () {}
        };

        createController = function () {
            controller = $controller('ModelsDetailsController', {
                $scope: scope,
                ModelResource: modelResource,
                NotificationService: notificationService,
                $stateParams: $stateParams,
                $state: $state,
                CommonTableParams: commonTableParams
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
        modelDetailsDeferred.resolve(modelsMock[0]);
        scope.$digest();
        expect(scope.state.value).to.be.equals(state.values.LOADED);
    });

    it('init, getModelMetadata success, split artifacts into two groups', function () {
        createController();
        modelDetailsDeferred.resolve(modelsMock[0]);
        scope.$digest();
        expect(scope.mainArtifact).to.be.deep.equal({id: '4321-1234', actions: ['publish_whatever']});
        expect(scope.extraArtifacts).to.be.deep.equal([{id: '1234-1234', actions: []}]);
    });

    it('getModelMetadata success, artifact action doesn\'t start with "publish", mainArtifact not set', function () {
        createController();
        modelDetailsDeferred.resolve(modelsMock[2]);
        scope.$digest();
        expect(scope.mainArtifact).to.be.undefined;
    });

    it('getModelMetadata reject, getTableParams not called', function () {
        var spy = sinon.spy(commonTableParams, 'getTableParams');
        createController();
        modelDetailsDeferred.reject({status: 404, data: {message: 'Some error message'}});
        scope.$digest();
        expect(spy).to.be.not.called;
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

    it('deleteModel, delete failed, do not notify about success, set deleteState to default', function () {
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

    it('deleteArtifact, invoke, set deleteArtifactState on pending', function () {
        createController();
        scope.deleteArtifact();
        scope.$digest();
        expect(scope.deleteArtifactState.value).to.be.equals(deleteArtifactState.values.PENDING);
    });

    it('deleteArtifact, success, redirect to models, set deleteArtifactState to default', function () {
        var spy = sinon.spy(notificationService, 'success');
        createController();
        deleteModelArtifactDeffered.resolve();
        scope.deleteArtifact();
        scope.$digest();
        expect(spy.called).to.be.true;
        expect(scope.deleteArtifactState.value).to.be.equals(deleteArtifactState.values.DEFAULT);
    });

    it('deleteArtifactModel, delete failed , do not notify about success, set deleteArtifactState to default', function () {
        var spy = sinon.spy(notificationService, 'success');
        createController();
        deleteModelArtifactDeffered.reject();
        scope.deleteArtifact();
        scope.$digest();
        expect(spy).not.to.be.called;
        expect(scope.deleteArtifactState.value).to.be.equals(deleteArtifactState.values.DEFAULT);
    });

    it('tryDeleteArtifact, invoke, user should be prompt about deleting artifact', function () {
        createController();
        scope.tryDeleteArtifact({filename: 'filename', id: '1234-5678'});
        scope.$digest();
        expect(notificationService.confirm.called).to.be.true;
    });

    it('tryDeleteArtifact, success, deleteArtifact should be called', function () {
        confirmDeferred.resolve();
        createController();
        scope.deleteArtifact = function (modelId) {};
        var spy = sinon.spy(scope, 'deleteArtifact');
        scope.tryDeleteArtifact({filename: 'filename', id: '1234-5678'});
        scope.$digest();
        expect(spy).to.be.calledWith('1234-5678');
    });
});
