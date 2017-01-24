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

describe("Unit: ServiceMetadataFetcher", function () {

    var sut,
        SAMPLE_INSTANCES = [{
            metadata: [
                {key: 'login', value: 'sample-login'},
                {key: 'password', value: 'sample-password'},
                {key: 'urls', value: 'sample-urls'}]
        }, {
            metadata: [
                {key: 'not-login', value: 'sample-not-login'},
                {key: 'not-password', value: 'sample-not-password'},
                {key: 'not-urls', value: 'sample-not-urls'}]
        }, {
            metadata: [
                {key: 'username', value: 'sample-username'},
                {key: 'password', value: 'sample-password'},
                {key: 'urls', value: 'sample-urls'}]
        }];

    beforeEach(module('app:core'));

    beforeEach(inject(function (ServiceMetadataFetcher) {
        sut = ServiceMetadataFetcher;
    }));

    it('should not be null', function () {
        expect(sut).not.to.be.null;
    });

    it('getLogin, success, login', function () {
        var login = sut.getLogin(SAMPLE_INSTANCES[0]);
        expect(login).to.be.equals('sample-login');
    });

    it('getLogin, success, username', function () {
        var login = sut.getLogin(SAMPLE_INSTANCES[2]);
        expect(login).to.be.equals('sample-username');
    });
    
    it('getLogin, failed', function () {
        var login = sut.getLogin(SAMPLE_INSTANCES[1]);
        expect(login).to.be.empty;
    });
    
    it('getPassword, success', function () {
        var password = sut.getPassword(SAMPLE_INSTANCES[0]);
        expect(password).to.be.equals('sample-password');
    });
    
    it('getPassword, failed', function () {
        var password = sut.getPassword(SAMPLE_INSTANCES[1]);
        expect(password).to.be.empty;
    });
    
    it('getUrl, success', function () {
        var url = sut.getUrl(SAMPLE_INSTANCES[0]);
        expect(url).to.be.equals('sample-urls');
    });
    
    it('getUrl, failed', function () {
        var url = sut.getUrl(SAMPLE_INSTANCES[1]);
        expect(url).to.be.empty;
    });
});
