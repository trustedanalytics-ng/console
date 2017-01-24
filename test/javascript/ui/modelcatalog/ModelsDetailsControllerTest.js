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
describe("Unit: ModelsDetailsController", function() {

    var controller,
        createController,
        scope,
        modelResource,
        modelDetailsDeferred,
        getAllScoringEngineInstancesDeferred,
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
        modelMetadataClient,
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
        };

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
        getAllScoringEngineInstancesDeferred = $q.defer();
        confirmDeferred = $q.defer();
        progressDeferred = $q.defer();

        modelResource = {
            getModelMetadata: sinon.stub().returns(modelDetailsDeferred.promise),
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
            createScoringEngine: sinon.stub().returns($q.defer().promise),
            getScoringEngineInstancesCreatedFromThatModel: sinon.stub().returns(getAllScoringEngineInstancesDeferred.promise),
            deleteScoringEngineInstances: sinon.stub()
        };

        modelMetadataClient = {
            deleteModel: sinon.stub().returns($q.defer().promise),
            updateName: sinon.stub().returns($q.defer().promise)
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
                ScoringEngineRetriever: scoringEngineRetriever,
                ModelMetadataClient: modelMetadataClient
            });
        };

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

    it('init, getModelMetadata success, set publishable as main artifact', function () {
        createController();
        scoringEngineRetriever.getPublishAction = sinon.stub();
        scoringEngineRetriever.getPublishAction.withArgs(modelsMock[0].artifacts[1]).returns('publish_whatever');
        modelDetailsDeferred.resolve(modelsMock[0]);
        scope.$digest();
        expect(scope.mainArtifact).to.be.deep.equal(modelsMock[0].artifacts[1]);
    });

    it('getModelMetadata success, artifact action doesn\'t start with "publish", set first on the list as main artifact', function () {
        createController();
        modelDetailsDeferred.resolve(modelsMock[2]);
        scope.$digest();
        expect(scope.mainArtifact).to.be.deep.equal({id: '1234-1234', actions: []});
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

    it('tryDeleteModel, invoke, set deleteState on pending', function () {
        scope.model = SAMPLE_MODEL;
        notificationService.confirm = sinon.stub().returns(successfulPromise());
        createController();

        scope.tryDeleteModel();
        scope.$digest();

        expect(scope.deleteState.value).to.be.equals(deleteState.values.PENDING);
    });

    it('tryDeleteModel, success, redirect to models, set deleteState to default', function () {
        scope.model = SAMPLE_MODEL;
        notificationService.confirm = sinon.stub().returns(successfulPromise());
        modelMetadataClient.deleteModel = sinon.stub().returns(successfulPromise());
        createController();

        scope.tryDeleteModel();
        scope.$digest();

        expect($state.go.calledWith(redirect)).to.be.true;
        expect(scope.deleteState.value).to.be.equals(deleteState.values.DEFAULT);
    });

    it('tryDeleteModel, delete failed, do not notify about success, set deleteState to default', function () {
        scope.model = SAMPLE_MODEL;
        notificationService.confirm = sinon.stub().returns(successfulPromise());
        modelMetadataClient.deleteModel = sinon.stub().returns(failedPromise({status: 404}));
        createController();

        scope.tryDeleteModel();
        scope.$digest();

        expect(notificationService.success).not.to.be.called;
        expect($state.go).not.to.be.called;
        expect(scope.deleteState.value).to.be.equals(deleteState.values.DEFAULT);
    });

    it('updateModelName, model name not changed, don\'t call updateModelMetadata method', function () {
        createController();
        scope.model = modelsMock[0];
        scope.updateModelName('name');
        expect(modelMetadataClient.updateName).not.to.be.called;
    });

    it('updateModelName, model name changed, call updateModelMetadata method', function () {
        createController();
        scope.model = modelsMock[0];
        scope.updateModelName('not-name');
        expect(modelMetadataClient.updateName).to.be.called;
    });

    it('addScoringEngine, invoke, setPending state', function () {
        scoringEngineRetriever.getPublishAction = sinon.stub().returns('publish_action');
        createController();

        scope.model = SAMPLE_MODEL;
        scope.extraArtifacts = [{id: SAMPLE_ARTIFACT.id, actions: []}];
        scope.addScoringEngine();
        scope.$digest();

        expect(scope.state.value).to.be.equals(addScoringEngineState.values.PENDING);
    });

    it('addScoringEngine, no publishable artifact, show error message', function () {
        createController();
        scope.model = SAMPLE_MODEL;
        scope.mainArtifact = null;
        scoringEngineRetriever.getPublishAction = sinon.stub().returns(null);

        scope.addScoringEngine();
        scope.$digest();

        expect(notificationService.error).to.be.called;
        expect(scoringEngineRetriever.createScoringEngine).not.to.be.called;
    });

    it('addScoringEngine, success, create correct path', function () {
        scoringEngineRetriever.getPublishAction = sinon.stub().returns('publish_action');
        scoringEngineRetriever.createScoringEngine = sinon.stub().returns(successfulPromise());

        createController();
        scope.model = SAMPLE_MODEL;
        scope.mainArtifact = SAMPLE_ARTIFACT;

        scope.addScoringEngine();
        scope.$digest();

        expect(scoringEngineRetriever.createScoringEngine).to.be.calledWith(SAMPLE_MODEL.id, SAMPLE_MODEL.name,
            SAMPLE_ARTIFACT);
        expect(scope.state.isLoaded(), 'loaded').to.be.true;
    });

    it('addScoringEngine, error, create correct path ', function () {
        scoringEngineRetriever.getPublishAction = sinon.stub().returns('publish_action');
        scoringEngineRetriever.createScoringEngine = sinon.stub().returns(failedPromise({data: {message: 'error message'}}));

        createController();
        scope.model = SAMPLE_MODEL;
        scope.mainArtifact = SAMPLE_ARTIFACT;

        scope.addScoringEngine();
        scope.$digest();

        expect(scoringEngineRetriever.createScoringEngine).to.be.calledWith(SAMPLE_MODEL.id, SAMPLE_MODEL.name,
            SAMPLE_ARTIFACT);
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
