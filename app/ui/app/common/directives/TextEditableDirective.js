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

(function () {
    "use strict";

    App.component('textEditable', {
        bindings: {
            text: '<',
            submit: '&'
        },
        templateUrl: 'app/common/directives/texteditable.html',
        controller: function (editableOptions, editableThemes) {

            editableOptions.theme = 'bs3';

            editableThemes.bs3.inputClass = 'input-lg';
            editableThemes.bs3.buttonsClass = 'btn-sm';
            editableThemes.bs3.submitTpl = '<button type="submit" class="btn btn-success"><span class="fa fa-check">' +
                '</span></button>';
            editableThemes.bs3.cancelTpl = '<button type="button" class="btn btn-default" ng-click="$form.$cancel()">' +
                '<span class="fa fa-times text-muted"></span>' +
                '</button>';

        }
    });
}());