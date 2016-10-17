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

    App.directive('fileExtensionValidator', function () {
        return  {
            require: 'ngModel',
            link: function(scope, elm, attrs, ctrl) {
                ctrl.$validators.fileExtension = function(modelValue, viewValue) {
                    if (ctrl.$isEmpty(modelValue)) {
                        return true;
                    }

                    if(!viewValue || !viewValue.name) {
                        return false;
                    }

                    var correctExtension = checkExtension(viewValue.name, attrs.fileExtensionValidator);
                    ctrl.$setValidity('extension', correctExtension);
                    return correctExtension;
                };

                attrs.$observe('fileExtensionValidator', ctrl.$validate);

                function checkExtension(filename, validExtension) {
                    if(validExtension === "*") {
                        return true;
                    }

                    return _.last(filename.split('.')) === validExtension.replace(/^\./, '');
                }
            }
        };
    });
}());