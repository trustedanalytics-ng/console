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
describe("Unit: ServicesController", function () {

    var controller,
        httpBackend,
        rootScope,
        createController,
        OfferingsResource,
        serviceListDeferred,
        _targetUrlBuilder,
        SERVICES_URL = '/mocked/services/url',
        targetProvider = {},
        state,
        scope;

    var serviceSample = {
        name: 'SomeService1',
        image: 'c29tZSBleGFtcGxlIGJhc2U2NCBpbWFnZQ==',
        description: 'Service one description',
        tags: ['tag1', 'tag2'],
        metadata: [{key: 'value'}]
    };

    var h2oServiceSample = {
        name: 'h2o-sample',
        description: 'h2o-model based offering description',
        metadata: [{key: 'MODEL_ID'}]
    };

    beforeEach(module('app'));

    beforeEach(module(function($provide){
        $provide.value('targetProvider', targetProvider);
    }));

    beforeEach(inject(function ($controller, $location, $httpBackend, $rootScope,
                                targetUrlBuilder, TestHelpers, _OfferingsResource_, $q) {
        httpBackend = $httpBackend;
        rootScope = $rootScope;
        OfferingsResource = _OfferingsResource_;
        _targetUrlBuilder = targetUrlBuilder;
        _targetUrlBuilder.get = function() {
            return SERVICES_URL;
        };
        new TestHelpers().stubTargetProvider(targetProvider);

        serviceListDeferred = $q.defer();
        OfferingsResource.getAll = sinon.stub().returns(serviceListDeferred.promise);
        scope = rootScope.$new();

        createController = function () {
            controller = $controller('ServicesController', {
                $scope: scope
            });
            state = controller.state;
        };
    }));

    it('should not be null', function () {
        expect(createController()).not.to.be.null;
    });

    it('init should get services', function () {
        createController();
        serviceListDeferred.resolve([serviceSample]);
        rootScope.$digest();
        expect(controller.offerings).to.deep.have.members([serviceSample]);
    });

    it('init should set status pending', function () {
        createController();
        expect(state.value).to.be.equals(state.values.PENDING);
    });

    it('init, got services, set status loaded', function () {
        createController();
        serviceListDeferred.resolve([serviceSample]);
        rootScope.$digest();
        expect(state.value).to.be.equals(state.values.LOADED);
    });

    it('init, got error, set status error', function () {
        controller = createController();
        serviceListDeferred.reject();
        rootScope.$digest();

        expect(state.value).to.be.equals(state.values.ERROR);
    });

    it('on targetChanged, get services again', function () {
        createController();

        rootScope.$broadcast('targetChanged');

        expect(OfferingsResource.getAll.calledTwice).to.be.true;
    });

    it('filterOfferings: empty searchText, should find service', function () {
        createController();
        controller.offerings = [serviceSample];

        scope.$emit('searchChanged', "");

        expect(controller.filtered).not.to.be.empty;
    });

    it('filterOfferings: name contains case insensitive string, should find service', function () {
        createController();
        controller.offerings = [serviceSample];

        scope.$emit('searchChanged', "service1");

        expect(controller.filtered).not.to.be.empty;
    });

    it('filterOfferings: description contains case insensitive string, should find service', function () {
        createController();
        controller.offerings = [serviceSample];

        scope.$emit('searchChanged', "ONE");

        expect(controller.filtered).not.to.be.empty;
    });

    it('filterOfferings: tags contains case insensitive string, should find service', function () {
        createController();
        controller.offerings = [serviceSample];

        scope.$emit('searchChanged', "Tag");

        expect(controller.filtered).not.to.be.empty;
    });

    it('filterOfferings: tags contains case insensitive string, should find service', function () {
        createController();
        controller.offerings = [serviceSample];

        scope.$emit('searchChanged', "Tag");

        expect(controller.filtered).not.to.be.empty;
    });

    it('filterOfferings: no property contains string, should not find service', function () {
        createController();
        controller.offerings = [serviceSample];

        scope.$emit('searchChanged', "asdasd");

        expect(controller.filtered).to.be.empty;
    });

    it('filterOfferings: should not find in image', function () {
        createController();
        controller.offerings = [serviceSample];

        scope.$emit('searchChanged', "c29");

        expect(controller.filtered).to.be.empty;
    });

    it('filtersOfferings: offering contains key "MODEL_ID" in metadata, list should be empty', function () {
        createController();
        controller.offerings = [h2oServiceSample];

        scope.$emit('searchChanged', "");
        expect(controller.filtered).to.be.empty;
    });

    it('filtersOfferings: offering doesn\'t contain key "MODEL_ID" in metadata, list should not be empty', function () {
        createController();
        controller.offerings = [serviceSample];

        scope.$emit('searchChanged', "");
        expect(controller.filtered).to.not.be.empty;
    })
});
