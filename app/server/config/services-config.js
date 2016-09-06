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
var _ = require('underscore'),
    config = require('./config'),
    defaults = require('./defaults.json'),
    localServices = require('./local-services.json'),
    serviceMappings = require('./service-mappings.json'),
    servicePrefixes = require('./service-prefixes.json');

var HOST_SUFFIX = "_HOST",
    PATH_PREFIX_SUFFIX = "_PREFIX";

function getServiceHost(service, path) {
    if(service.domainRewrite) {
        return serviceDomainRewrite(service, path);
    }
    var envValue = process.env[toEnvNotation(service.name) + HOST_SUFFIX];
    if(envValue) {
        return envValue;
    }

    var ups = config.getUserProvidedSerice(service.name);
    if(ups) {
        return ups.host;
    }

    console.info('Using default url for service %s: %s', service.name);
    return localServices[service.name];
}

function serviceDomainRewrite(service, path) {
    var domain = config.getDomain();
    var parameters = path.match(service.path);
    var subdomain = parameters[1];
    var endpoint = parameters[2];

    var host = "http://" + subdomain + "." + domain;
    if(endpoint) {
        host += (service.endpoint || "") + "/" + endpoint;
    }
    return host;
}

function getServiceByPath(requestUrl) {
    return _.find(serviceMappings, function(service){
        return requestUrl.match(defaults.reverse_proxy.request_prefix + service.path);
    });
}

function getServicePrefix(service) {
    var envValue = process.env[toEnvNotation(service.name) + PATH_PREFIX_SUFFIX];
    if(envValue) {
        return envValue;
    }
    var configValue = _.findWhere(servicePrefixes, {name: service.name});
    if(configValue) {
        return configValue.value;
    }

    return defaults.reverse_proxy.prefix;
}

function toEnvNotation(name) {
    return name.toUpperCase().split("-").join("_");
}

function getServiceTimeout(service) {
    return service.timeout || config.get('timeout');
}

module.exports = {
    getServiceHost: getServiceHost,
    getServiceByPath: getServiceByPath,
    getServicePrefix: getServicePrefix,
    getServiceTimeout: getServiceTimeout
};