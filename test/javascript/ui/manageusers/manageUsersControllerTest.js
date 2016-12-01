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
describe("Unit: ManageUsersController", function () {

    var $controller;
    var scope;
    var $rootScope;
    var state;
    var userServiceMock;
    var userProviderMock;
    var targetProvider;
    var users;
    var currentUser;
    var UserActionsNotificationsService;
    var $q;
    beforeEach(module('app', function($provide) {
        UserActionsNotificationsService =  {
            userAdded: sinon.stub(),
            userNotAdded: sinon.stub(),
            userInvited: sinon.stub()
        };

        $provide.value('UserActionsNotificationsService', UserActionsNotificationsService);
    }));

    beforeEach(inject(function (_$controller_, _$rootScope_, /*, orgUserService, */State, _$q_) {
        $rootScope = _$rootScope_;
        $controller = _$controller_;
        scope = $rootScope.$new();
        targetProvider = {};
        state = new State();
        $q = _$q_;
        users = [
            {
                "guid": 1,
                "username": "User 1",
                "roles": ["User"]
            },
            {
                "guid": 2,
                "username": "User 2",
                "roles": ["User", "Admin"]
            }
        ];
        currentUser = {
            "email": "email@email"
        };

        var userDeferred = $q.defer();

        userProviderMock = {
            getUser: sinon.stub().returns(userDeferred.promise)
        };

        userServiceMock = {
            getTargetType: sinon.stub(),
            getRoles: sinon.stub(),
            withErrorMessage: function() {
                return this;
            }
        };

    }));

    function getSUT() {
        return $controller('ManageUsersController', {
            $scope: scope,
            UserService: userServiceMock,
            UserProvider: userProviderMock,
            UserActionsNotificationsService: UserActionsNotificationsService,
            targetProvider: targetProvider
        });
    }

    function createAndInitSUT() {
        var deferred = $q.defer();
        userServiceMock.getAll = sinon.stub().returns(deferred.promise);
        deferred.resolve(users);

        var controller = getSUT();
        $rootScope.$digest();
        return controller;
    }


    it('should not be null', function () {
        var controller = createAndInitSUT();
        expect(controller).not.to.be.null;
        expect(userServiceMock.getAll.called).to.be.true;
    });

    it('should on users successfully returned set state loaded', function () {
        createAndInitSUT();
        expect(scope.state.value).to.be.equals(state.values.LOADED);
    });

    it('should on error retrieving users set state error', function () {
        var deferred = $q.defer();
        userServiceMock.getAll = sinon.stub().returns(deferred.promise);
        deferred.reject();
        getSUT();
        $rootScope.$digest();
        expect(scope.state.value).to.be.equals(state.values.ERROR);
    });

    it('should on users successfully returned put them in the scope', function () {
        createAndInitSUT();
        expect(scope.users).to.be.equals(users);
    });

    it('should on organization not chosen display appropriate error message', function () {
        userServiceMock.targetAvailable = function () {
            return false;
        };
        createAndInitSUT();
        expect(scope.targetAvailable()).to.be.false;
    });

    it('should refresh users on targetChanged', function () {
        createAndInitSUT();
        scope.tableParams = {
            reload: sinon.stub(),
            page: sinon.stub()
        };

        $rootScope.$broadcast('targetChanged');
        $rootScope.$digest();
        expect(userServiceMock.getAll.called).to.be.true;
        expect(scope.tableParams.reload.called).to.be.true;
    });

    it('should show dialog on successful user add, pass data to service and reload user list', function () {
       var user = {
           username: "zdzislaw",
           role: "admin"
       };

       createAndInitSUT();

       scope.tableParams = {
           reload: sinon.stub(),
           page: sinon.stub()
       };

       var deferred = $q.defer();
       userServiceMock.addUser = sinon.stub().returns(deferred.promise);
       deferred.resolve(user);

       scope.userToAdd = user;
       scope.addUser();
       scope.$root.$digest();
       expect(userServiceMock.addUser).to.be.calledWith({username: user.username, role: user.role.toUpperCase()});
       expect(UserActionsNotificationsService.userAdded.called).to.be.true;
       expect(userServiceMock.getAll.called).to.be.true;
       expect(scope.tableParams.reload.called).to.be.true;
    });

    it('should show dialog on successful user invite when user is null and reload user list', function () {

       createAndInitSUT();

       scope.tableParams = {
           reload: sinon.stub(),
           page: sinon.stub()
       };

       var deferred = $q.defer();
       userServiceMock.addUser = sinon.stub().returns(deferred.promise);
       deferred.resolve(null);

       scope.addUser();
       scope.$root.$digest();
       expect(userServiceMock.addUser.called).to.be.true;
       expect(UserActionsNotificationsService.userAdded.called).to.be.false;
       expect(UserActionsNotificationsService.userInvited.called).to.be.true;
       expect(userServiceMock.getAll.called).to.be.true;
       expect(scope.tableParams.reload.called).to.be.true;
    });

    it('should show dialog on unsuccessful user add ', function () {

       var deferred = $q.defer();
       userServiceMock.addUser = sinon.stub().returns(deferred.promise);
       var deferredAll = $q.defer();
       userServiceMock.getAll = sinon.stub().returns(deferred.promise);
       deferredAll.resolve([]);
       getSUT();
       scope.$root.$digest();
       scope.addUser();
       deferred.reject();
       scope.$root.$digest();
       expect(scope.state.isLoaded()).to.be.true;
    });
});
