/**
 * Copyright (c) 2017 Intel Corporation
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
describe("Unit: ApplicationMarketplaceRegistrator", function () {
    var sut,
        offeringsResource,
        notificationService,
        $q,
        $rootScope;

    var APP_ID = 'app-id-1234',
        SAMPLE_OFFERINGS = [{
            id: 1,
            metadata: [{
                key: "APPLICATION_ID",
                value: "banana"
            }]
        }, {
            id: 2,
            metadata: [{
                key: "BAD_KEY",
                value: "BAD_VALUE"
            }, {
                key: "APPLICATION_ID",
                value: APP_ID,
            }]
        }, {
            id: 3,
            metadata: [{
                key: "APPLICATION_ID",
                value: APP_ID
            }]
        }],
        SAMPLE_OFFERING_REQUEST = {
            applicationId: APP_ID
        };

    beforeEach(module('app:core'));

    beforeEach(module(function($provide){
        offeringsResource  = {};
        $provide.value('OfferingsResource', offeringsResource);

        notificationService = {
            success: sinon.stub()
        };
        $provide.value('NotificationService', notificationService);
    }));

    beforeEach(inject(function(_$q_, _$rootScope_) {
        $q = _$q_;
        $rootScope = _$rootScope_;
        offeringsResource.withErrorMessage = sinon.stub().returnsThis();
        offeringsResource.getAll = sinon.stub().returns($q.defer().promise);
        offeringsResource.createFromApplication = sinon.stub().returns($q.defer().promise);
    }));

    beforeEach(inject(function(ApplicationMarketplaceRegistrator) {
        sut = ApplicationMarketplaceRegistrator;
    }));

    it('getOfferingsOfApplication, get all', function () {
        sut.getOfferingsOfApplication(APP_ID);

        expect(offeringsResource.getAll).to.be.called;
    });

    it('getOfferingsOfApplication, get all success, return offerings with app id', function (done) {
        offeringsResource.getAll = sinon.stub().returns(successfulPromise(SAMPLE_OFFERINGS));

        sut.getOfferingsOfApplication(APP_ID)
            .then(function (offerings) {
                expect(offerings).not.to.be.empty;
                expect(offerings.length, 'offerings count').to.be.equal(2);
                expect(offerings[0].id).to.be.equal(2);
                expect(offerings[1].id).to.be.equal(3);
                done();
            });

        $rootScope.$digest();
    });

    it('getOfferingsOfApplication, get all failed, throw error', function (done) {
        offeringsResource.getAll = sinon.stub().returns(rejectedPromise());

        sut.getOfferingsOfApplication(APP_ID)
            .then(function () {
                throw new Error("getOfferingsOfApplication was unexpectedly fulfilled");
            })
            .catch(function() {
                // do nth
            })
            .finally(function() {
                done();
            });

        $rootScope.$digest();
    });

    it('registerApplication, create offering', function () {
        sut.registerApplication(SAMPLE_OFFERING_REQUEST);

        expect(offeringsResource.createFromApplication).to.be.calledWith(SAMPLE_OFFERING_REQUEST);
    });

    it('registerApplication, create offering success, show ok message', function (done) {
        offeringsResource.createFromApplication = sinon.stub().returns(successfulPromise());

        sut.registerApplication(SAMPLE_OFFERING_REQUEST)
            .then(function() {
                expect(notificationService.success).to.be.called;
                done();
            });

        $rootScope.$digest();
    });

    it('registerApplication, create offering success, throw error', function (done) {
        offeringsResource.createFromApplication = sinon.stub().returns(rejectedPromise());

        sut.registerApplication(SAMPLE_OFFERING_REQUEST)
            .catch(function() {
                expect(notificationService.success).not.to.be.called;
            })
            .finally(function() {
                done();
            });

        $rootScope.$digest();
    });

    function successfulPromise() {
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