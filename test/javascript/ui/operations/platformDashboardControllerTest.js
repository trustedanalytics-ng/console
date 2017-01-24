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
describe("Unit: PlatformDashboardController", function () {

    var controller,
        scope,
        rootScope,
        state,
        ConfigResource;

    beforeEach(module('app:core', function ($provide) {
        $provide.value('ConfigResource', ConfigResource);
    }));

    beforeEach(inject(function ($injector, $rootScope, $q) {
        rootScope = $rootScope;
        scope = $rootScope.$new();

        ConfigResource = {
            getSessionConfig: sinon.stub().returns($q.defer().promise)
        };

        getSUT($injector);
        state = scope.state;
    }));

    function getSUT($injector) {
        controller = $injector.get('$controller')('PlatformDashboardController', {
            $scope: scope,
            ConfigResource: ConfigResource,
            $state: {}
        });
        return controller;
    }

    it('should not be null', function () {
        expect(controller).not.to.be.null;
    });

    it('init, set pending and call metrics with load', function () {
        expect(scope.state.isPending(), 'pending').to.be.true;
        expect(ConfigResource.getSessionConfig).to.be.called;
    });

});