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
describe("Unit: AppDevelopmentController", function () {

    var controller,
        createController,
        userAgentMock,
        cliConfigurationMock,
        platformInfoProviderMock,
        userProviderMock,
        state;

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, _$rootScope_, _$q_, State) {
        $q = _$q_;
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();

        userAgentMock = {};
        cliConfigurationMock = {};
        platformInfoProviderMock = {
            getPlatformInfo: sinon.stub().returns(getUnresolvedPromise())
        };
        userProviderMock = {
            getUser: sinon.stub().returns(getUnresolvedPromise())
        };
        state = new State();

        createController = function() {
            controller = $controller('AppDevelopmentController', {
                $scope: scope,
                userAgent: userAgentMock,
                CliConfiguration: cliConfigurationMock,
                PlatformInfoProvider: platformInfoProviderMock,
                UserProvider: userProviderMock
            });
        };
    }));

    it('should not be null', function () {
        createController();

        expect(controller).not.to.be.null;
    });

    it('init, call get user', function () {
        createController();
        $rootScope.$digest();

        expect(userProviderMock.getUser).to.be.called;
        expect(scope.username).to.be.empty;
    });

    it('init, call get user success, set username', function () {
        userProviderMock.getUser = sinon.stub().returns(getResolvedPromise({
            username: "banana"
        }));

        createController();
        $rootScope.$digest();

        expect(userProviderMock.getUser).to.be.called;
        expect(scope.username).to.be.equal("banana");
    });

    it('init, call get platform info', function () {
        createController();
        $rootScope.$digest();

        expect(platformInfoProviderMock.getPlatformInfo).to.be.called;
        expect(scope.apiEndpoint).to.be.empty;
    });

    it('init, call get platform info success, set api endpoint', function () {
        platformInfoProviderMock.getPlatformInfo = sinon.stub().returns(getResolvedPromise({
            api_endpoint: "https://api.example.com/"
        }));

        createController();
        $rootScope.$digest();

        expect(platformInfoProviderMock.getPlatformInfo).to.be.called;
        expect(scope.apiEndpoint).to.be.equal("https://api.example.com");
    });


    function getUnresolvedPromise() {
        return $q.defer().promise;
    }

    function getResolvedPromise(data) {
        var deferred = $q.defer();
        deferred.resolve(data);
        return deferred.promise;
    }

    function getRejectedPromise(data) {
        var deferred = $q.defer();
        deferred.reject(data);
        return deferred.promise;
    }
});
