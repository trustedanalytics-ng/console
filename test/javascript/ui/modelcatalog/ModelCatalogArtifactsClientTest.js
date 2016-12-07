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

describe("Unit: ModelCatalogArtifactsClient", function () {

    var sut,
        $q,
        $rootScope,
        State,
        ModelResource,
        NotificationService,
        FileUploaderService;

    beforeEach(module('app'));

    beforeEach(module(function($provide) {
        ModelResource = {
            withErrorMessage: sinon.stub().returnsThis()
        };
        $provide.value('ModelResource', ModelResource);

        NotificationService = {
            success: sinon.stub()
        };
        $provide.value('NotificationService', NotificationService);

        FileUploaderService = {
            uploadFiles: sinon.stub()
        };
        $provide.value('FileUploaderService', FileUploaderService);

    }));

    beforeEach(inject(function (ModelResource, NotificationService, ModelCatalogArtifactsClient, _$q_, _State_,
                                _$rootScope_) {
        $q = _$q_;
        $rootScope = _$rootScope_;
        State = _State_;

        ModelResource.deleteModelArtifact = sinon.stub().returns($q.defer().promise);
        NotificationService.progress = sinon.stub().returns($q.defer().promise);

        sut = ModelCatalogArtifactsClient;
    }));

    it('should not be null', function () {
        expect(sut).not.to.be.null;
    });

    it('deleteArtifact, invoke, set deleteArtifactState on pending', function () {
        var state = new State();
        sut.deleteArtifact(null, null, state);
        $rootScope.$apply();
        expect(state.value).to.be.equals(state.values.PENDING);
    });

    it('deleteArtifact, success, display notification with success message', function () {
        var state = new State();
        ModelResource.deleteModelArtifact = sinon.stub().returns(successPromise());
        sut.deleteArtifact(null, null, state, function () {});
        $rootScope.$apply();
        expect(NotificationService.success).to.be.called;
    });

    it('deleteArtifact, success, set deleteArtifactState on default', function () {
        var state = new State();
        ModelResource.deleteModelArtifact = sinon.stub().returns(successPromise());
        sut.deleteArtifact(null, null, state, function () {});
        $rootScope.$apply();
        expect(state.value).to.be.equals(state.values.DEFAULT);
    });

    it('deleteArtifact, reject, set deleteArtifactState on default', function () {
        var state = new State();
        var cb = sinon.stub();
        ModelResource.deleteModelArtifact = sinon.stub().returns(rejectPromise());
        sut.deleteArtifact(null, null, state, cb);
        $rootScope.$apply();
        expect(state.value).to.be.equals(state.values.DEFAULT);
    });

    it('uploadArtifact, invoke, set addArtifactState on pending', function () {
        var state = new State();
        sut.uploadArtifact(null, {}, state);
        $rootScope.$apply();
        expect(state.value).to.be.equals(state.values.PENDING);
    });

    it('uploadArtifact, invoke, NotificationService progress method called', function () {
        var state = new State();
        sut.uploadArtifact(null, {}, state);
        expect(NotificationService.progress).to.be.called;
    });

    it('uploadArtifact, success, set addArtifactState to default', function () {
        var state = new State();
        var cb = sinon.stub();
        NotificationService.progress = sinon.stub().returns(successPromise());
        sut.uploadArtifact(null, {}, state, cb);
        $rootScope.$apply();
        expect(state.value).to.be.equals(state.values.DEFAULT);
    });

    it('uploadArtifact, success, callback method called', function () {
        var state = new State();
        var cb = sinon.stub();
        NotificationService.progress = sinon.stub().returns(successPromise());
        sut.uploadArtifact(null, {}, state, cb);
        $rootScope.$apply();
        expect(cb).to.be.called;
    });

    it('uploadArtifact, reject, callback method not called', function () {
        var state = new State();
        var cb = sinon.stub();
        NotificationService.progress = sinon.stub().returns(rejectPromise());
        sut.uploadArtifact(null, {}, state, cb);
        $rootScope.$apply();
        expect(cb).to.not.be.called;
    });
    
    function successPromise(param) {
        var deferred = $q.defer();
        deferred.resolve(param);
        $rootScope.$digest();
        return deferred.promise;
    }

    function rejectPromise(data) {
        var deferred = $q.defer();
        deferred.reject(data);
        return deferred.promise;
    }
});