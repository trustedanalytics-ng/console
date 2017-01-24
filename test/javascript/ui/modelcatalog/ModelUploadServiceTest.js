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

describe("Unit: ModelUploadService", function() {

    var service,
        targetProvider,
        notificationService,
        $q,
        fileUploaderService,
        modelsResource,
        SAMPLE_MODEL = {
            name: 'name',
            method: 'method',
            modelType: 'spark',
            description: 'description'
        },
        SAMPLE_MODEL_ID = {id: '1234'},
        SAMPLE_UPLOAD_FILES_RESPONSE = {
            status: "status",
            data: {
                message: "message"
            }
        },
        SAMPLE_ARTIFACT = {
            filename: "/tmp/fake",
            artifactActions: ["PUBLISH_JAR_SCORING_ENGINE"]
        };

    beforeEach(module('app:core'));

    beforeEach(module(function($provide){
        $provide.value('FileUploaderService', fileUploaderService);
        $provide.value('$state', {
            go: sinon.stub()
        });
    }));


    beforeEach(inject(function (_ModelUploadService_) {
        service = _ModelUploadService_;
    }));


    beforeEach(inject(function ($controller, $rootScope, _$q_) {
        $q = _$q_;

        targetProvider = {
            getOrganization: sinon.stub().returns({ guid: 'o1' })
        };

        fileUploaderService = {
            uploadFiles: sinon.stub(),
            toJsonBlob: sinon.stub().returnsArg(0)
        };

        modelsResource = {
            addModelMetadata: sinon.stub(),
            withErrorMessage: function () {}
        };

        notificationService = {
            progress: function () {},
            error: function () {}
        };

    }));

    it('addModelMetadata, success, should return model ', function () {

        modelsResource.addModelMetadata = sinon.stub().returns(successfulPromise(SAMPLE_MODEL_ID));

        service.addModelMetadata(SAMPLE_MODEL)
            .then(function (model) {
                expect(model).to.be.deep.equal(SAMPLE_MODEL_ID);
            });

    });

    it('addModelMetadata, reject, should return withErrorMessage', function () {

        var errorSpy = sinon.spy(modelsResource, 'withErrorMessage');

        modelsResource.addModelMetadata = sinon.stub().returns(rejectedPromise());

        service.addModelMetadata(SAMPLE_MODEL)
            .then(function () {
                expect(errorSpy).to.be.called();
            });
    });

    it('addModelArtifact, success, should return notification.progress with result from fileUploadService', function () {

        var errorSpy = sinon.spy(notificationService, 'error');

        fileUploaderService.uploadFiles = sinon.stub().returns(successfulPromise(SAMPLE_UPLOAD_FILES_RESPONSE));

        service.addModelArtifact(SAMPLE_ARTIFACT, SAMPLE_MODEL_ID.id)
            .then(function (result) {
                expect(fileUploaderService.toJsonBlob).to.be.calledWith(SAMPLE_ARTIFACT.artifactActions);
                expect(result).to.be.deep.equal(notificationService.progress(SAMPLE_UPLOAD_FILES_RESPONSE));
                expect(errorSpy).not.to.be.called();
            });
    });

    it('addModelArtifact, reject, should return error', function () {

        var errorSpy = sinon.spy(notificationService, 'error');

        fileUploaderService.uploadFiles = sinon.stub().returns(rejectedPromise());

        service.addModelArtifact(SAMPLE_ARTIFACT, SAMPLE_MODEL_ID.id)
            .then(function (result) {
                expect(fileUploaderService.toJsonBlob).to.be.calledWith(SAMPLE_ARTIFACT.artifactActions);
                expect(result).not.to.be.deep.equal(notificationService.progress(SAMPLE_UPLOAD_FILES_RESPONSE));
                expect(errorSpy).to.be.called();
            });
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