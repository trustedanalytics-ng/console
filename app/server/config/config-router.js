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

var express = require('express'),
    config = require('./config');

var configRouter = function() {
    var router = express.Router();

    router.get('/uploader', function(req, res) {
            res.send(config.get("UPLOADER_CONFIG"));
        }
    );

    router.get('', function(req, res) {
            res.send(config.getFew(["METRICS_GRAFANA_HOST", "SESSION_CONFIG"]));
        }
    );

    return router;
};

module.exports = configRouter;