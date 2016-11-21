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
describe("Unit: GearPumpAppDeployController", function () {

    var controller,
        createController,
        rootScope,
        scope,
        httpBackend,
        locationMock,
        _targetProvider,
        fileUploaderServiceMock,
        state,
        serviceInstancesMapperMock,
        notificationService,
        gearPumpAppDeployResource,
        toolsInstanceResourceMock,
        serviceInstancesResourceMock,
        $q,
        organization = { guid: 111, name: "org" },
        space = { guid: 222, name: "space"},
        INSTANCE_NAME = 'someInstance',
        INSTANCE_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        SOME_GUID =   'cccccccc-cccc-cccc-cccc-cccccccccccc',
        SERVICE_LABEL = 'kafka',
        INSTANCE_METADATA = [
            {
                "key": "USERNAME",
                "value": "username"
            },
            {
                "key": "PASSWORD",
                "value": "password"
            },
            {
                "key": "urls",
                "value": "gp-ui-00000000-0000-0000-0000-000000000000.domain.com"
            }
        ],
        GEARPUMP_INSTANCE_DATA = [{
            "id": INSTANCE_ID,
            "name": INSTANCE_NAME,
            "type": "SERVICE",
            "classId": SOME_GUID,
            "metadata": INSTANCE_METADATA,
            "state": "RUNNING",
            "serviceName": "gearpump",
            "planName": "free"
        }],
        EXAMPLE_FORM = {
            jarFile: 'someName',
            configFile: 'someConfName',
            appResultantArguments: 'args',
            usersArguments: 'uArgs',
            instances: {
                someInstance: 'someName'
            }
        },
        EXAMPLE_INSTANCE_GENERATED_STRUCTURE = '{"kafka":{"someInstance":{"USERNAME":"username","PASSWORD":"password","urls":"gp-ui-00000000-0000-0000-0000-000000000000.domain.com"}}}';

    beforeEach(module('app', function($provide) {
        _targetProvider = {
            getOrganization:function () {
                return organization;
            },
            getSpace: function () {
                return space;
            }
        };

        toolsInstanceResourceMock = {
            getToolsInstances: function () {
                return resolvedPromise( GEARPUMP_INSTANCE_DATA );
            }
        };

        fileUploaderServiceMock = {};
        $provide.value('FileUploaderService', fileUploaderServiceMock);
        $provide.value('ServiceInstancesResource', serviceInstancesResourceMock);
        $provide.value('ToolsInstanceResource', toolsInstanceResourceMock);
        $provide.value('targetProvider', _targetProvider);
    }));

    beforeEach(inject(function ($controller, $location, $rootScope, _$q_, Restangular,
                                ServiceInstancesResource, ServiceInstancesMapper, State,
                                _$httpBackend_, NotificationService, GearPumpAppDeployResource) {

        state = new State();
        $q = _$q_;
        httpBackend = _$httpBackend_;
        rootScope = $rootScope;
        scope = $rootScope.$new();

        serviceInstancesResourceMock = Restangular.service("services");
        serviceInstancesResourceMock.getAll = function() {
            return resolvedPromise( GEARPUMP_INSTANCE_DATA );
        };

        serviceInstancesMapperMock = ServiceInstancesMapper;
        notificationService = NotificationService;
        gearPumpAppDeployResource = GearPumpAppDeployResource;
        locationMock = $location;


        createController = function() {
            controller = $controller('GearPumpAppDeployController', {
                $routeParams: { instanceId: INSTANCE_NAME },
                $scope: scope,
                $location: locationMock,
                FileUploaderService: fileUploaderServiceMock,
                NotificationService: notificationService,
                ServiceInstancesMapper: serviceInstancesMapperMock,
                ServiceInstancesResource: serviceInstancesResourceMock,
                GearPumpAppDeployResource: gearPumpAppDeployResource,
                $state: state
            });
        };

        createController();
    }));

    it('controller should not be null', function () {
        expect(controller).not.to.be.null;
    });

    it('instanceCheckboxChange, checked success, get service\'s data and set in scope', function () {

        scope.gpInstanceName = INSTANCE_NAME;
        scope.uploadFormData = { instances: {} };
        scope.uploadFormData.instances[INSTANCE_ID] = 'someData';

        scope.setAppArguments = sinon.stub().returns(resolvedPromise());

        scope.instanceCheckboxChange(INSTANCE_ID, INSTANCE_NAME, SERVICE_LABEL, INSTANCE_METADATA);
        rootScope.$digest();

        expect(scope.uploadFormData.appResultantArguments).to.be.equal('tap=' + EXAMPLE_INSTANCE_GENERATED_STRUCTURE);

    });

    it('instanceCheckboxChange, unchecked, unset instance\'s data in scope', function () {

        scope.gpInstanceName = INSTANCE_NAME;
        scope.uploadFormData = { instances: {} };
        scope.setAppArguments = sinon.stub().returns(resolvedPromise());

        scope.instanceCheckboxChange(INSTANCE_ID, INSTANCE_NAME, SERVICE_LABEL, INSTANCE_METADATA);
        rootScope.$digest();

        expect(scope.uploadFormData.appResultantArguments).to.be.equal('tap={}');

    });

    it('instanceCheckboxChange, checked error, error while getting data', function () {

        scope.gpInstanceName = INSTANCE_NAME;
        scope.uploadFormData = { instances: {} };

        scope.setAppArguments = sinon.stub().returns(rejectedPromise());

        scope.instanceCheckboxChange(INSTANCE_ID, SERVICE_LABEL, INSTANCE_NAME);
        rootScope.$digest();

        expect(scope.uploadFormData.instances[INSTANCE_ID]).to.be.undefined;
        expect(scope.uploadFormData.appResultantArguments).to.be.equal('tap={}');

    });

    it('usersArgumentsChange, add first element, create app resultant arguments', function () {

        scope.gpInstanceName = INSTANCE_NAME;
        scope.uploadFormData = { appResultantArguments: {} };

        scope.usersParameters = [{ key: 'someKey', value: 'someValue' }];
        scope.usersArgumentsChange();
        rootScope.$digest();

        expect(scope.uploadFormData.appResultantArguments).to.be.equal('tap={"usersArgs":{"someKey":"someValue"}}');

    });

    it('usersArgumentsChange, add twice, create app resultant arguments', function () {

        scope.gpInstanceName = INSTANCE_NAME;
        scope.uploadFormData = { appResultantArguments: {} };

        scope.usersParameters = [{ key: 'someKey', value: 'someValue' }];
        scope.usersArgumentsChange();
        rootScope.$digest();

        scope.usersParameters = [{ key: 'someKey2', value: 'someValue2' }];
        scope.usersArgumentsChange();
        rootScope.$digest();

        expect(scope.uploadFormData.appResultantArguments).to.be.equal('tap={"usersArgs":{"someKey2":"someValue2"}}');

    });

    it('usersArgumentsChange, add and remove, create app resultant arguments', function () {

        scope.gpInstanceName = INSTANCE_NAME;
        scope.uploadFormData = { appResultantArguments: {} };

        scope.usersParameters = [{ key: 'someKey', value: 'someValue' }];
        scope.usersArgumentsChange();
        rootScope.$digest();

        scope.usersParameters = [];
        scope.usersArgumentsChange();
        rootScope.$digest();

        expect(scope.uploadFormData.appResultantArguments).to.be.equal('tap={}');

    });

    it('deployGPApp, success, deploy application on Apache Gearpump', function () {

        scope.gpInstanceName = INSTANCE_NAME;
        httpBackend.whenPOST('/rest/gearpump/instanceName/login').respond();

        scope.uiInstanceName = 'instanceName';
        scope.gpUiData = {
            login: 'login',
            password: 'pass'
        };

        gearPumpAppDeployResource.getGPToken = sinon.stub().returns(resolvedPromise());
        notificationService.progress = sinon.stub().returns(resolvedPromise());
        fileUploaderServiceMock.uploadFiles = sinon.stub().returns(resolvedPromise({
            data: 'great',
            status: 200,
            loaded: 100
        }));

        scope.deployGPApp();
        rootScope.$digest();

        expect(fileUploaderServiceMock.uploadFiles).to.be.called;
        expect(notificationService.progress).to.be.called;
        expect(scope.state.value).to.be.equal(state.values.LOADED);

    });

    it('deployGPApp, upload error, deploy application on Apache Gearpump', function () {

        scope.gpInstanceName = INSTANCE_NAME;
        scope.uiInstanceName = 'instanceName';
        scope.gpUiData = {
            login: 'login',
            password: 'pass'
        };

        gearPumpAppDeployResource.getGPToken = sinon.stub().returns(resolvedPromise());
        notificationService.progress = sinon.stub().returns(resolvedPromise());
        fileUploaderServiceMock.uploadFiles = sinon.stub().returns(rejectedPromise({
            status: 404
        }));

        scope.deployGPApp();
        rootScope.$digest();

        expect(fileUploaderServiceMock.uploadFiles).to.be.called;
        expect(notificationService.progress).to.be.called;
        expect(scope.state.value).to.be.equal(state.values.LOADED);

    });

    it('clearForm, clear form, clear form input fields', function () {

        scope.gpInstanceName = INSTANCE_NAME;
        scope.uploadFormData = EXAMPLE_FORM;
        scope.usersParameters = [ { key: null, value: null } ];

        scope.clearForm();
        rootScope.$digest();

        expect(scope.uploadFormData.jarFile).to.be.equal('');
        expect(scope.uploadFormData.configFile).to.be.equal('');
        expect(scope.uploadFormData.appResultantArguments).to.be.equal('tap={}');
        expect(scope.uploadFormData.usersArguments).to.be.equal('');
        expect(scope.usersParameters).to.be.deep.equal([]);
        expect(scope.uploadFormData.instances).to.be.deep.equal({});

    });

    function resolvedPromise(params) {
        var deferred = $q.defer();
        deferred.resolve(params);
        return deferred.promise;
    }

    function rejectedPromise(params) {
        var deferred = $q.defer();
        deferred.reject(params);
        return deferred.promise;
    }

});