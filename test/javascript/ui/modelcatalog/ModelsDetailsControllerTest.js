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
        scoringEngineResource,
        modelDetailsDeferred,
        deleteModelDeferred,
        modelUpdateDeferred,
        getAllScoringEngineInstancesDeferred,
        addScoringEngineDeferred,
        confirmDeferred,
        progressDeferred,
        notificationService,
        commonTableParams,
        state,
        scoringEngineState,
        deleteState,
        addScoringEngineState,
        $state,
        $stateParams,
        $q,
        fileUploaderService,
        modelCatalogArtifactsClient,
        scoringEngineRetriever,
        modelsMock,
        redirect = 'app.modelcatalog.models',
        SAMPLE_MODEL = {
            creationTool : 'h2o',
            id: "1234",
            name: 'superModel',
            artifacts: [{
                actions: []
            }, {
                actions: ["PUBLISH_TAP_SCORING_ENGINE"]
            }]
        },
        SAMPLE_ARTIFACT = {
            id: "1234",
            actions: ["PUBLISH_TAP_SCORING_ENGINE"]
        },
        TAP_SCORING_ENGINE_PATH = "tap-scoring-engine";

    beforeEach(module('app:core'));

    beforeEach(inject(function ($controller, $rootScope, _$q_, State, ModelsMock) {
        modelsMock = ModelsMock;
        scope = $rootScope.$new();
        $q = _$q_;
        state = new State();
        deleteState = new State();
        scoringEngineState = new State();
        addScoringEngineState = new State();
        modelDetailsDeferred = $q.defer();
        modelUpdateDeferred = $q.defer();
        deleteModelDeferred = $q.defer();
        getAllScoringEngineInstancesDeferred = $q.defer();
        addScoringEngineDeferred = $q.defer();
        confirmDeferred = $q.defer();
        progressDeferred = $q.defer();

        modelResource = {
            getModelMetadata: sinon.stub().returns(modelDetailsDeferred.promise),
            updateModelMetadata: sinon.stub().returns(modelUpdateDeferred.promise),
            deleteModel: sinon.stub().returns(deleteModelDeferred.promise),
            withErrorMessage: sinon.stub().returnsThis()
        };

        scoringEngineResource = {
            addScoringEngine: sinon.stub(),
            withErrorMessage: sinon.stub().returnsThis()
        };

        notificationService = {
            success: sinon.stub(),
            confirm: sinon.stub().returns(confirmDeferred.promise),
            progress: sinon.stub().returns(progressDeferred.promise),
            withErrorMessage: sinon.stub().returnsThis(),
            error: sinon.stub()
        };

        commonTableParams = {
            getTableParams: function () {}
        };

        scoringEngineRetriever = {
            getScoringEngineInstancesCreatedFromThatModel: sinon.stub().returns(getAllScoringEngineInstancesDeferred.promise),
            deleteScoringEngineInstances: sinon.stub()
        };

        modelCatalogArtifactsClient = {
            deleteArtifact: sinon.stub(),
            uploadArtifact: sinon.stub()
        };

        $state = {
            go: sinon.stub()
        };

        $stateParams = {
            modelId: 1234
        };

        createController = function () {
            controller = $controller('ModelsDetailsController', {
                $scope: scope,
                ModelResource: modelResource,
                NotificationService: notificationService,
                $state: $state,
                $stateParams: $stateParams,
                CommonTableParams: commonTableParams,
                FileUploaderService: fileUploaderService,
                ScoringEngineRetriever: scoringEngineRetriever,
                ScoringEngineResource: scoringEngineResource,
                ModelCatalogArtifactsClient: modelCatalogArtifactsClient
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

    it('init, set scoringEngineState to pending', function () {
        createController();
        expect(scope.scoringEngineState.value).to.be.equals(state.values.PENDING);
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
        modelResource.getModelMetadata = sinon.stub().returns(deferred.promise);
        deferred.reject({status: 404, data: {message: 'Model not found'}});
        createController();
        scope.$digest();
        expect($state.go.calledWith(redirect)).to.be.true;
    });

    it('init, getModelMetadata other than 404 error, set state on error', function () {
        modelDetailsDeferred.reject({status: 500, data: {message: 'error message'}});
        createController();
        scope.$digest();
        expect(scope.state.value).to.be.equals(state.values.ERROR);
        expect(notificationService.error).to.be.called;
    });

    it('init, getScoringEngineInstancesCreatedFromThatModel called', function () {
        createController();
        expect(scoringEngineRetriever.getScoringEngineInstancesCreatedFromThatModel).to.be.called;
    });

    it('getScoringEngineInstancesFromThatModel, invoke, set scoringEngineState on pending', function () {
        createController();
        expect(scope.scoringEngineState.value).to.be.equals(scoringEngineState.values.PENDING);
    });

    it('getScoringEngineInstancesFromThatModel, success, set scoringEngineState on loaded', function () {
        createController();
        getAllScoringEngineInstancesDeferred.resolve();
        scope.$digest();
        expect(scope.scoringEngineState.value).to.be.equals(scoringEngineState.values.LOADED);
    });

    it('getScoringEngineInstancesFromThatModel, reject, set scoringEngineState on error', function () {
        createController();
        getAllScoringEngineInstancesDeferred.reject();
        scope.$digest();
        expect(scope.scoringEngineState.value).to.be.equals(scoringEngineState.values.ERROR);
    });

    it('deleteModel, invoke, set deleteState on pending', function () {
        createController();
        scope.deleteModel();
        scope.$digest();
        expect(scope.deleteState.value).to.be.equals(deleteState.values.PENDING);
    });

    it('deleteModel, success, redirect to models, set deleteState to default', function () {
        createController();
        deleteModelDeferred.resolve();
        scope.deleteModel();
        scope.$digest();
        expect(notificationService.success).to.be.called;
        expect($state.go.calledWith(redirect)).to.be.true;
        expect(scope.deleteState.value).to.be.equals(deleteState.values.DEFAULT);
    });

    it('deleteModel, delete failed, do not notify about success, set deleteState to default', function () {
        createController();
        deleteModelDeferred.reject({status: 404});
        scope.deleteModel();
        scope.$digest();
        expect(notificationService.success).not.to.be.called;
        expect($state.go).not.to.be.called;
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

    it('tryDeleteArtifact, invoke, user should be prompt about deleting artifact', function () {
        createController();
        scope.tryDeleteArtifact({filename: 'filename', id: '1234-5678'});
        scope.$digest();
        expect(notificationService.confirm.called).to.be.true;
    });

    it('tryDeleteArtifact, success, deleteArtifact should be called', function () {
        confirmDeferred.resolve();
        createController();
        scope.tryDeleteArtifact({filename: 'filename', id: '1234-5678'});
        scope.$digest();
        expect(modelCatalogArtifactsClient.deleteArtifact).to.be.calledWith($stateParams.modelId, '1234-5678');
    });

    it('tryUploadArtifact, invoke, popup window should appear', function () {
        createController();
        scope.tryUploadArtifact();
        scope.$digest();
        expect(notificationService.confirm.called).to.be.true;
    });

    it('tryUploadArtifact, success, uploadArtifact should be called', function () {
        confirmDeferred.resolve();
        createController();
        scope.tryUploadArtifact();
        scope.$digest();
        expect(modelCatalogArtifactsClient.uploadArtifact).to.be.calledWith($stateParams.modelId);
    });

    it('addScoringEngine, invoke, setPending state', function () {
        scoringEngineResource.addScoringEngine=sinon.stub().returns(addScoringEngineDeferred.promise);

        createController();

        scope.model = SAMPLE_MODEL;
        scope.extraArtifacts = [{id: SAMPLE_ARTIFACT.id, actions: []}];
        scope.addScoringEngine();
        scope.$digest();

        expect(scope.state.value).to.be.equals(addScoringEngineState.values.PENDING);
    });

    it('addScoringEngine, no main artifact, show error message', function () {
        scoringEngineResource.addScoringEngine = sinon.stub().returns(addScoringEngineDeferred.promise);

        createController();
        scope.model = SAMPLE_MODEL;
        scope.mainArtifact = null;

        scope.addScoringEngine();
        scope.$digest();

        expect(notificationService.error).to.be.called;
        expect(scoringEngineResource.addScoringEngine).not.to.be.called;
    });

    it('addScoringEngine, success, create correct path', function () {
        scoringEngineResource.addScoringEngine = sinon.stub().returns(successfulPromise());
        addScoringEngineDeferred.resolve();

        createController();
        scope.model = SAMPLE_MODEL;
        scope.mainArtifact = SAMPLE_ARTIFACT;

        scope.addScoringEngine();
        scope.$digest();

        expect(scoringEngineResource.addScoringEngine).to.be.calledWith(TAP_SCORING_ENGINE_PATH, {
            modelId: SAMPLE_MODEL.id,
                artifactId: SAMPLE_ARTIFACT.id,
                modelName: SAMPLE_MODEL.name
        });
        expect(notificationService.success).to.be.called;
        expect(scope.state.isLoaded(), 'loaded').to.be.true;
    });

    it('addScoringEngine, error, create correct path ', function () {
        scoringEngineResource.addScoringEngine = sinon.stub().returns(failedPromise({data: {message: 'error message'}}));

        createController();
        scope.model = SAMPLE_MODEL;
        scope.mainArtifact = SAMPLE_ARTIFACT;

        scope.addScoringEngine();
        scope.$digest();

        expect(scoringEngineResource.addScoringEngine).to.be.calledWith(TAP_SCORING_ENGINE_PATH, {
            modelId: SAMPLE_MODEL.id,
            artifactId: SAMPLE_ARTIFACT.id,
            modelName: SAMPLE_MODEL.name
        });
        expect(notificationService.success).not.to.be.called;
        expect(scope.state.value).to.be.equals(addScoringEngineState.values.LOADED);
    });

    function successfulPromise(data) {
        var deferred = $q.defer();
        deferred.resolve(data);
        return deferred.promise;
    }

    function failedPromise(data) {
        var deferred = $q.defer();
        deferred.reject(data);
        return deferred.promise;
    }
});
