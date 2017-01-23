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
    'use strict';

    App.directive('dateValidator', function () {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attr, ctrl) {
                function validator(ngModelValue) {
                    var regexPattern = new RegExp(attr.patternValidator);

                    if (regexPattern.test(ngModelValue.toLocaleDateString())) {
                        ctrl.$setValidity('regexValidator', true);
                    }
                    else {
                        ctrl.$setValidity('regexValidator', false);
                    }

                    return ngModelValue;
                }

                ctrl.$parsers.push(validator);
            }
        };
    });

}());