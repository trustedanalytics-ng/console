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
function throwError(res, status, name, message, originalError) {
    var timestamp = new Date().getTime();
    var error = {
        error: name,
        status: status,
        message: message,
        timestamp: timestamp
    };
    var args = ["Error processing request", error];
    if(originalError) {
        args.push(originalError);
    }
    console.error.apply(console, args);
    try {
        res.status(status).send(error);
    } catch(e) {
        console.error("Failed to send response", e.message, e.stack);
    }
}

module.exports = {
    throw: throwError
};
