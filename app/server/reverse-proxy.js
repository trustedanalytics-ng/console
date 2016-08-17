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
var request = require('request'),
    urlJoin = require('url-join'),
    util = require('util'),
    defaults = require('./config/defaults.json'),
    servicesConfig = require('./config/services-config'),
    httpException = require('./utils/http-exception'),
    gatewayErrors = require('./gateway-errors');


function forwardRequest(req, res) {
    var path = req.url;
    var service = servicesConfig.getServiceByPath(path);
    if(!service) {
        throw404(res, util.format("No service found for the path: %s", JSON.stringify(path)));
        return;
    }
    var host = servicesConfig.getServiceHost(service, path);
    if(!host) {
        throw404(res, util.format("No route found for service  %s", JSON.stringify(service)));
        return;
    }
    var targetUrl;
    if(service.domainRewrite) {
        targetUrl = host;
    } else {
        var cleanPath = path.replace(defaults.reverse_proxy.request_prefix, '');
        var prefix = servicesConfig.getServicePrefix(service);
        targetUrl = urlJoin(host, prefix, cleanPath);
    }

    setHeaders(req);
    req.clearTimeout();

    req.pipe(request({
            url: targetUrl,
            method: req.method,
            timeout: servicesConfig.getServiceTimeout(service)
        },
        handleProxyError(res, service.name, path)
    )).pipe(res);
}

function setHeaders(req) {
    if(req.user && req.user.accessToken) {
        req.headers['Authorization'] = 'bearer ' + req.user.accessToken;
    }
    req.headers['x-forwarded-host'] = req.headers['host'];
}

function handleProxyError(res, serviceName, path) {
    return function(httpError) {
        if(!httpError) {
            return;
        }

        var error = gatewayErrors.getError(httpError.code);
        httpException.throw(res, error.code, error.title, util.format(error.description, serviceName, path), httpError);
    };
}

function throw404(res, message) {
    httpException.throw(res, 404, "Not Found", message);
}

module.exports = {
    forward: forwardRequest
};
