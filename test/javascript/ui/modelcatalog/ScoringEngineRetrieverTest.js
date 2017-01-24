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

describe("Unit: ScoringEngineRetriever", function () {

    var sut,
        $q,
        $rootScope,
        State,
        ServiceInstancesResource;

    var instances = [{
        metadata: [
            {key: 'test-key', value: 'test-value'},
            {key: 'urls', value: 'some-url'}
        ]
    }, {
        metadata: [
            {key: 'test-key', value: 'test-value'},
            {key: 'urls', value: 'some-url'},
            {key: 'MODEL_ID', value: 1234}
        ]
    }];


    beforeEach(module('app:core'));

    beforeEach(module(function($provide) {
        ServiceInstancesResource = {
            withErrorMessage: sinon.stub().returnsThis()
        };
        $provide.value('ServiceInstancesResource', ServiceInstancesResource);
    }));

    beforeEach(inject(function (ServiceInstancesResource, NotificationService, ScoringEngineRetriever, _$q_, _State_,
                                _$rootScope_) {
        $q = _$q_;
        $rootScope = _$rootScope_;
        State = _State_;

        ServiceInstancesResource.getAll = sinon.stub().returns($q.defer().promise);
        ServiceInstancesResource.deleteInstance = sinon.stub().returns($q.defer().promise);

        sut = ScoringEngineRetriever;
    }));

    it('should not be null', function () {
        expect(sut).not.to.be.null;
    });

    it('getScoringEngineInstancesCreatedFromThatModel, success, filter instances created from that model', function () {
        var modelId = 1234;
        ServiceInstancesResource.getAll = sinon.stub().returns(successPromise(instances));

        sut.getScoringEngineInstancesCreatedFromThatModel(modelId, new State(), new State())
            .then(function (filteredInstances) {
                expect(filteredInstances.length).to.be.equals(1);
            });

        $rootScope.$apply();

    });

    function successPromise(param) {
        var deferred = $q.defer();
        deferred.resolve(param);
        $rootScope.$digest();
        return deferred.promise;
    }
});