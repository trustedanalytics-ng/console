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
        SAMPLE_INSTANCES = [
                    {metadata: {login: 'sample-login', password: 'sample-password', urls: 'sample-url'}},
                    {metadata: {username: 'sample-login'}},
                    {metadata: {}}
                ];

    beforeEach(module('app'));

    beforeEach(inject(function (ServiceMetadataFetcher) {
        sut = ServiceMetadataFetcher;
    }));

    it('should not be null', function () {
        expect(sut).not.to.be.null;
    });

    it('getLogin, success, login', function () {
        var login = sut.getLogin(SAMPLE_INSTANCES[0]);

        expect(login).to.be.equals(SAMPLE_INSTANCES[0].metadata.login);
    });

    it('getLogin, success, username', function () {
        var login = sut.getLogin(SAMPLE_INSTANCES[1]);
        expect(login).to.be.equals(SAMPLE_INSTANCES[1].metadata.username);
    });
    
    it('getLogin, failed', function () {
        var login = sut.getLogin(SAMPLE_INSTANCES[2]);
        expect(login).to.be.empty;
    });
    
    it('getPassword, success', function () {
        var password = sut.getPassword(SAMPLE_INSTANCES[0]);
        expect(password).to.be.equals(SAMPLE_INSTANCES[0].metadata.password);
    });
    
    it('getPassword, failed', function () {
        var password = sut.getPassword(SAMPLE_INSTANCES[2]);
        expect(password).to.be.empty;
    });
    
    it('getUrl, success', function () {
        var url = sut.getUrl(SAMPLE_INSTANCES[0]);
        expect(url).to.be.equals(SAMPLE_INSTANCES[0].metadata.urls);
    });
    
    it('getUrl, failed', function () {
        var url = sut.getUrl(SAMPLE_INSTANCES[2]);
        expect(url).to.be.empty;
    });
});
