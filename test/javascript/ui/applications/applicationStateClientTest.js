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
describe("Unit: ApplicationStateClient", function () {

    var sut,
        $q,
        $rootScope,
        $state,
        State,
        ApplicationResource,
        ServiceInstancesResource,
        NotificationService,
        SAMPLE_GUID = "sample-guid-123";

    beforeEach(module('app:core'));

    beforeEach(module(function($provide) {
        ApplicationResource = {
            withErrorMessage: sinon.stub().returnsThis()
        };
        $provide.value('ApplicationResource', ApplicationResource);
        ServiceInstancesResource = {
            withErrorMessage: sinon.stub().returnsThis()
        };
        $provide.value('ServiceInstancesResource', ServiceInstancesResource);
        NotificationService = {
            success: sinon.stub()
        };
        $provide.value('NotificationService', NotificationService);
        $state = {
            go: sinon.stub()
        };
        $provide.value('$state', $state);
    }));

    beforeEach(inject(function(ServiceInstancesResource, ApplicationStateClient, _$q_, _$rootScope_, _State_) {
        $q = _$q_;
        $rootScope = _$rootScope_;
        State = _State_;

        ApplicationResource.start = sinon.stub().returns($q.defer().promise);
        ApplicationResource.stop = sinon.stub().returns($q.defer().promise);
        ApplicationResource.restart = sinon.stub().returns($q.defer().promise);

        sut = ApplicationStateClient;
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