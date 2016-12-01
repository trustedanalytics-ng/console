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

describe("Unit: ModelUploadController", function() {

    var controller,
        createController,
        scope,
        addModelDeferred,
        targetProvider,
        notificationService,
        state,
        $q,
        $state,
        fileUploaderService,
        redirect = 'app.modelcatalog.models',
        SAMPLE_MODEL = {id: '1234'},
        SAMPLE_UPLOAD_MODEL = {
            modelType: 'spark',
            filename: {
                name: "filename.txt"
            },
            filename2: {
                name: "filename.mar"
            },
            extension: '.mar',
            action: ["PUBLISH_TO_TAP_SCORING_ENGINE"]
        };

    beforeEach(module('app'));

    beforeEach(module(function($provide){
        $provide.value('targetProvider', targetProvider);
    }));

    beforeEach(inject(function ($controller, $rootScope, _$q_, _$state_, State) {
        scope = $rootScope.$new();
        $q = _$q_;
        state = new State();
        $state = _$state_;
        addModelDeferred = $q.defer();

        targetProvider = {
            getOrganization: sinon.stub().returns({ guid: 'o1' })
        };

        createController = function () {
            controller = $controller('ModelUploadController', {
                $scope: scope,
                targetProvider: targetProvider,
                NotificationService: notificationService,
                $state: $state,
                FileUploaderService: fileUploaderService,
                ModelUploadService: modelUploadService
            });
        };

        modelUploadService = {
            addModelMetadata: sinon.stub(),
            addModelArtifact: sinon.stub()
        };

        fileUploaderService = {
            uploadFiles: sinon.stub()
        };

        notificationService = {
            success: function () {},
            error: function () {}
        };

    }));

    it('should not be null', function () {
        createController();
        expect(controller).not.to.be.null;
    });

    it('init, set state loaded', function () {
        createController();
        expect(scope.state.isLoaded(), 'loaded').to.be.true;
    });

    it('addModel, set state pending ', function () {
        createController();
        modelUploadService.addModelMetadata = sinon.stub().returns($q.defer().promise);
        modelUploadService.addModelArtifact = sinon.stub().returns($q.defer().promise);
        scope.addModel();
        scope.$digest();
        expect(scope.state.value).to.be.equals(state.values.PENDING);
    });


    it('addModel, success, set state loaded, redirect to models', function () {
        var redirectSpied = sinon.spy($state, 'go');
        var successSpied = sinon.spy(notificationService, 'success');

        modelUploadService.addModelMetadata = sinon.stub().returns(successfulPromise(SAMPLE_MODEL));
        modelUploadService.addModelArtifact = sinon.stub().returns(successfulPromise());

        createController();

        scope.addModel();
        scope.$digest();

        expect(successSpied.calledTwice).to.be.true;
        expect(redirectSpied.calledWith(redirect)).to.be.true;
        expect(scope.state.value).to.be.equals(state.values.LOADED);
    });

    it('addModel, adding metadata - success, adding artifact - reject', function () {
        var redirectSpied = sinon.spy($state, 'go');
        var errorSpied = sinon.spy(notificationService, 'error');
        var successSpied = sinon.spy(notificationService, 'success');

        modelUploadService.addModelMetadata = sinon.stub().returns(successfulPromise(SAMPLE_MODEL));
        modelUploadService.addModelArtifact = sinon.stub().returns(rejectedPromise());

        createController();

        scope.addModel();
        scope.$digest();

        expect(successSpied.called).to.be.true;
        expect(errorSpied.called).to.be.true;
        expect(redirectSpied.calledWith(redirect)).not.to.be.true;
        expect(scope.state.value).to.be.equals(state.values.PENDING);
    });

    it('addModel, adding metadata - reject, ', function () {
        var redirectSpied = sinon.spy($state, 'go');
        var successSpied = sinon.spy(notificationService, 'success');

        modelUploadService.addModelMetadata = sinon.stub().returns(rejectedPromise());

        createController();

        scope.addModel();
        scope.$digest();

        expect(successSpied.called).not.to.be.true;
        expect(redirectSpied.calledWith(redirect)).not.to.be.true;
        expect(scope.state.value).to.be.equals(state.values.PENDING);
    });

    it('type changed, set supportedExtension, artifactAction', function () {
        createController();

        scope.uploadModel.modelType = SAMPLE_UPLOAD_MODEL.modelType;
        scope.uploadModel.filename = SAMPLE_UPLOAD_MODEL.filename;

        scope.typeChanged();

        expect(scope.supportedExtension).deep.equals(SAMPLE_UPLOAD_MODEL.extension);
        expect(scope.uploadModel.artifactAction).deep.equals(SAMPLE_UPLOAD_MODEL.action);
    });


    function successfulPromise(data) {
        var deferred = $q.defer();
        deferred.resolve(data);
        return deferred.promise;
    }

    function rejectedPromise(data) {
        var deferred = $q.defer();
        deferred.reject(data);
        return deferred.promise;
    }
});