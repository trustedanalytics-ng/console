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
describe("Unit: UsersRoleMapperService", function () {
    var UserRoleMapperService;
    beforeEach(module('app'));

    beforeEach(inject(function (_UserRoleMapperService_) {
        UserRoleMapperService = _UserRoleMapperService_;
    }));

    it('should convert user checkboxes to roles', function() {
        var users = [
            {
                guid: "1234",
                role: "admin"
            },
            {
                guid: "2345",
                role: null
            },
            {
                guid: "3456"
            }
        ];

        var expectedCheckboxes = {
            "1234": {
                admin: true
            },
            "2345": {
                admin: false
            },
            "3456": {
                admin: false
            }
        };
        var resultCheckboxes = UserRoleMapperService.mapRolesToCheckboxes(users);
        expect(resultCheckboxes).to.be.deep.equal(expectedCheckboxes);
    });

    it('should convert empty role to USER', function() {
        var user = {
            username: "bozydar",
            role: null
        };
        var expectedUser = {
            username: "bozydar",
            role: "USER"
        };
        var resultUser = UserRoleMapperService.mapSingleRoleToArray(user);
        expect(resultUser).to.be.deep.equal(expectedUser);
    });

});