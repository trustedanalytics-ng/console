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
describe("Unit: ApplicationHelper", function () {

    var sut,
        $q,
        $rootScope,
        $state,
        State,
        ApplicationResource,
        NotificationService,
        SAMPLE_GUID = "sample-guid-123",
        SAMPLE_APP = { id: SAMPLE_GUID };

    beforeEach(module('app'));

    beforeEach(module(function($provide) {
        ApplicationResource = {
            withErrorMessage: sinon.stub().returnsThis()
        };
        $provide.value('ApplicationResource', ApplicationResource);
        NotificationService = {
            success: sinon.stub()
        };
        $provide.value('NotificationService', NotificationService);
        $state = {
            go: sinon.stub()
        };
        $provide.value('$state', $state);
    }));

    beforeEach(inject(function(ApplicationHelper, _$q_, _$rootScope_, _State_) {
        $q = _$q_;
        $rootScope = _$rootScope_;
        State = _State_;

        ApplicationResource.getApplication = sinon.stub().returns($q.defer().promise);
        ApplicationResource.start = sinon.stub().returns($q.defer().promise);
        ApplicationResource.stop = sinon.stub().returns($q.defer().promise);
        ApplicationResource.restart = sinon.stub().returns($q.defer().promise);

        sut = ApplicationHelper;
    }));

    beforeEach(inject(function($httpBackend, $rootScope) {
        // workaround for 'Unexpected request GER /rest/orgs' issued by router.
        // I couldn't find better solution for it so far.
        $httpBackend.expectGET('/rest/orgs').respond(function() {
           return null;
        });
        $rootScope.$digest();
    }));


    it('should not be null', function () {
        expect(sut).not.to.be.null;
    });

    it('startApplication, success, show success message', function() {
        ApplicationResource.start = sinon.stub().returns(successPromise());

        sut.startApplication(SAMPLE_GUID);
        $rootScope.$apply();

        expect(ApplicationResource.start).to.be.calledWith(SAMPLE_GUID);
        expect(NotificationService.success).to.be.called;
    });

    it('startApplication, failed, do not show success message', function() {
        ApplicationResource.start = sinon.stub().returns(failedPromise());
        var catchCb = sinon.stub();

        sut.startApplication(SAMPLE_GUID)
            .catch(catchCb);
        $rootScope.$apply();

        expect(ApplicationResource.start).to.be.calledWith(SAMPLE_GUID);
        expect(NotificationService.success).not.to.be.called;
    });

    it('stopApplication, success, show success message', function() {
        ApplicationResource.start = sinon.stub().returns(successPromise());

        sut.startApplication(SAMPLE_GUID);
        $rootScope.$apply();

        expect(ApplicationResource.start).to.be.calledWith(SAMPLE_GUID);
        expect(NotificationService.success).to.be.called;
    });

    it('stopApplication, failed, do not show success message', function() {
        ApplicationResource.stop = sinon.stub().returns(failedPromise());
        var catchCb = sinon.stub();

        sut.stopApplication(SAMPLE_GUID)
            .catch(catchCb);
        $rootScope.$apply();

        expect(ApplicationResource.stop).to.be.calledWith(SAMPLE_GUID);
        expect(NotificationService.success).not.to.be.called;
    });

    it('restartApplication, success, show success message', function() {
        ApplicationResource.restart = sinon.stub().returns(successPromise());

        sut.restartApplication(SAMPLE_GUID);
        $rootScope.$apply();

        expect(ApplicationResource.restart).to.be.calledWith(SAMPLE_GUID);
        expect(NotificationService.success).to.be.called;
    });

    it('restartApplication, failed, do not show success message', function() {
        ApplicationResource.restart = sinon.stub().returns(failedPromise());
        var catchCb = sinon.stub();

        sut.restartApplication(SAMPLE_GUID)
            .catch(catchCb);
        $rootScope.$apply();

        expect(ApplicationResource.restart).to.be.calledWith(SAMPLE_GUID);
        expect(NotificationService.success).not.to.be.called;
    });

    it('getApplication, pass resource result', function() {
        var resourceResult = $q.defer().promise;
        ApplicationResource.getApplication = sinon.stub().returns(resourceResult);

        var result = sut.getApplication(SAMPLE_GUID)
        $rootScope.$apply();

        expect(ApplicationResource.getApplication).to.be.calledWith(SAMPLE_GUID);
        expect(result).to.be.equal(resourceResult);
    });

    it('deleteApplication, success, go to list and display success message', function() {
        ApplicationResource.deleteApplication = sinon.stub().returns(successPromise());
        var state = new State();

        sut.deleteApplication(state, SAMPLE_GUID)
        $rootScope.$apply();

        expect(ApplicationResource.deleteApplication).to.be.calledWith(SAMPLE_GUID);
        expect(NotificationService.success).to.be.called;
        expect($state.go).to.be.calledWith('app.applications');
    });

    it('deleteApplication, failure, stay on the same page and set loaded state', function() {
        ApplicationResource.deleteApplication = sinon.stub().returns(failedPromise());
        var state = new State();

        sut.deleteApplication(state, SAMPLE_GUID)
        $rootScope.$apply();

        expect(ApplicationResource.deleteApplication).to.be.calledWith(SAMPLE_GUID);
        expect(NotificationService.success).not.to.be.called;
        expect($state.go).not.to.be.called;
        expect(state.isLoaded(), 'isLoaded').to.be.true;
    });


    function successPromise(param) {
        var deferred = $q.defer();
        deferred.resolve(param);
        $rootScope.$digest();
        return deferred.promise;
    }

    function failedPromise(param) {
        var deferred = $q.defer();
        deferred.reject(param);
        return deferred.promise;
    }

});