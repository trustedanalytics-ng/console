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
describe("Unit: PlatformInfoProvider", function() {

    var sut,
        platformInfoResource,
        rootScope;

    var PLATFORM_INFO_DEFAULT = Object.freeze({
        api_endpoint: "http://api.example.com",
        plain: function() { return this; }
    });

    beforeEach(module('app'));

    beforeEach(module(function($provide){
        platformInfoResource = {
            getPlatformInfo: sinon.stub(),
            withErrorMessage: function() { return this; }
        };
        $provide.value('PlatformInfoResource', platformInfoResource);
    }));

    beforeEach(inject(function(PlatformInfoProvider, $rootScope){
        rootScope = $rootScope;
        sut = PlatformInfoProvider;
    }));

    it('getPlatformInfo, query resource and return value', inject(function($q){
        platformInfoResource.getPlatformInfo = sinon.spy(function() {
            var deferred = $q.defer();
            deferred.resolve(PLATFORM_INFO_DEFAULT);
            return deferred.promise;
        });

        var result = null;
        sut.getPlatformInfo()
            .then(function(data){
                result = data;
            });
        rootScope.$apply();

        expect(platformInfoResource.getPlatformInfo).to.be.called;
        expect(result).to.be.equal(PLATFORM_INFO_DEFAULT);
    }));

});
