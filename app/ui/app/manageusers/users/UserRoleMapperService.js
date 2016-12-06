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
(function () {
    "use strict";

    App.service('UserRoleMapperService', function () {
        return {
            mapRolesToCheckboxes: function (users) {
                var ids = _.pluck(users, 'guid');
                var roles = _.map(users, function (user) {
                        var roles = {};
                        roles['admin'] = (user.role || '').toLowerCase() === 'admin';
                        return roles;
                    }
                );

                return _.object(ids, roles);
            },
            mapSingleRoleToArray: function(userModel) {
                return {
                    username: userModel.username,
                    role: (userModel.role || 'USER').toUpperCase()
                };
            }
        };
    });
}());
