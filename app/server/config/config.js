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
var _ = require('underscore'),
    defaults = require('./defaults.json');

var vcapServices = JSON.parse(process.env.VCAP_SERVICES || '{}');
var userProvided = vcapServices['user-provided'] || [];
var ssoEnvList = _.keys(process.env).filter(function(vcapServiceName) {
    return vcapServiceName.indexOf('SSO_') === 0;
});

function getUserProvidedSerice(name) {
    var service = _.findWhere(userProvided, { name: name });
    return service && service.credentials;
}

function getDomain() {
    return getVariable('PLATFORM_DOMAIN');
}

function getVariable(name) {
    if(!name || !_.isString(name)) {
        return null;
    }
    return process.env[name.toUpperCase()] || defaults[name.toLowerCase()];
}

function getFewVariable(name) {
    var response = {};
    name.forEach(function(entry){
        if(!entry || !_.isString(entry)) {
            return null;
        }
        var key = entry.toLowerCase();
        response[key] = process.env[entry.toUpperCase()] || defaults[entry.toLowerCase()];
    });
    return response;
}


function getSso() {
    var sso = getUserProvidedSerice('sso') || {};
    ssoEnvList.forEach(function(env){
        if(process.env[env]) {
            var userProvidedName = envNameToUserProvidedName(env);
            sso[userProvidedName] = process.env[env];
        }
    });
    return sso;
}

function envNameToUserProvidedName(env) {
    var envCamelCase = env.split('_')
        .slice(1)
        .map(capitalize)
        .join('');
    return envCamelCase[0].toLowerCase().concat(envCamelCase.substr(1));
}

function capitalize(input) {
    return input[0].toUpperCase() + input.substr(1).toLowerCase();
}

module.exports = {
    getUserProvidedSerice: getUserProvidedSerice,
    getDomain: getDomain,
    getSso: getSso,
    getFew: getFewVariable,
    get: getVariable
};
