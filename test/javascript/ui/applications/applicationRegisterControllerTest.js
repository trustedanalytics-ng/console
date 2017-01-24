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
describe("Unit: ApplicationRegisterController", function () {
    var scope,
        sut,
        state,
        applicationMarketplaceRegistrator,
        $q,
        createController;

    var APP_ID = 'app-guid-1234';

    beforeEach(module('app:core'));

    beforeEach(inject(function($controller, $rootScope, State, _$q_) {
        scope = $rootScope.$new();
        $q = _$q_;
        applicationMarketplaceRegistrator = {
            registerApplication: sinon.stub().returns($q.defer().promise),
            getOfferingsOfApplication: sinon.stub().returns($q.defer().promise)
        };

        state = new State();
        scope.appId = APP_ID;

        createController = function () {
            sut = $controller('ApplicationRegisterController', {
                $scope: scope,
                ApplicationMarketplaceRegistrator: applicationMarketplaceRegistrator,
                $stateParams: {}
            });
        };
    }));

    it('should not be null', function () {
        createController();

        expect(sut).not.to.be.null;
    });

    it('init, set state loaded', function () {
        createController();

        expect(scope.state.isLoaded(), 'state').to.be.true;
    });

    it('init, get offerings', function () {
        createController();

        expect(scope.offeringsState.isPending(), 'offerings state').to.be.true;
        expect(applicationMarketplaceRegistrator.getOfferingsOfApplication).to.be.calledWith(APP_ID);
    });

    it('init, get offerings failed, set status loaded', function () {
        applicationMarketplaceRegistrator.getOfferingsOfApplication = sinon.stub().returns(rejectedPromise());

        createController();
        scope.$digest();

        expect(scope.offeringsState.isLoaded(), 'offerings state').to.be.true;
        expect(scope.offerings).to.be.empty;
    });

    it('init, get offerings success, set offerings and status loaded', function () {
        var offerings = [{
            id: 11
        }, {
            id: 22
        }];
        applicationMarketplaceRegistrator.getOfferingsOfApplication = sinon.stub().returns(successfulPromise(offerings));

        createController();
        scope.$digest();

        expect(scope.offeringsState.isLoaded(), 'offerings state').to.be.true;
        expect(scope.offerings).to.be.deep.equal(offerings);
    });

    it('submitRegister, call create offering', function () {
        createController();

        scope.submitRegister();
        scope.$digest();

        expect(applicationMarketplaceRegistrator.registerApplication).to.be.called;
        expect(scope.state.isPending(), 'state').to.be.true;
    });

    it('submitRegister, create offering fails, set state loaded and do not refresh offerings', function () {
        createController();
        applicationMarketplaceRegistrator.registerApplication = sinon.stub().returns(rejectedPromise());

        scope.submitRegister();
        scope.$digest();

        expect(applicationMarketplaceRegistrator.getOfferingsOfApplication).to.be.calledOnce; // + during init
        expect(scope.state.isLoaded(), 'state').to.be.true;
    });

    it('submitRegister, create offering success, set state loaded and refresh offerings', function () {
        createController();
        applicationMarketplaceRegistrator.registerApplication = sinon.stub().returns(successfulPromise());

        scope.submitRegister();
        scope.$digest();

        expect(applicationMarketplaceRegistrator.getOfferingsOfApplication).to.be.calledTwice; // + during init
        expect(scope.state.isLoaded(), 'state').to.be.true;
    });

    function successfulPromise(data) {
        var deferred = $q.defer();
        deferred.resolve.apply(deferred, arguments);
        return deferred.promise;
    }

    function rejectedPromise() {
        var deferred = $q.defer();
        deferred.reject.apply(deferred, arguments);
        return deferred.promise;
    }
});