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
describe("Unit: UserService", function () {

    var $httpBackend;
    var userServiceSUT;
    var targetProviderStub;
    var $rootScope;

    beforeEach(module('app:core'));

    beforeEach(module(function($provide){
        targetProviderStub = {};
        $provide.value('targetProvider', targetProviderStub);
    }));

    beforeEach(inject(function (_UserService_, $injector, _$httpBackend_, _$rootScope_) {
        $httpBackend = _$httpBackend_;
        userServiceSUT = _UserService_;
        $rootScope = _$rootScope_;
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });


    it('should call for users from apropriate organization on refresh', inject(function () {
        targetProviderStub.getOrganization = sinon.stub().returns({ guid: "1234" });

        var callbackSpied = sinon.stub();
        $httpBackend.expectGET('/rest/orgs/1234/users').respond(200, []);

        userServiceSUT.getAll()
            .then(callbackSpied);
        $httpBackend.flush();

        expect(callbackSpied.called).to.be.true;
    }));

    it('should fail while calling for users form unavailable organization on refresh', inject(function () {
        targetProviderStub.getOrganization = sinon.stub().returns({});

        var errcallbackSpied = sinon.stub();

        userServiceSUT.getAll().catch(errcallbackSpied);

        $rootScope.$digest();
        expect(errcallbackSpied.called).to.be.true;
    }));

});
