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

    App.controller('ModelsEditController', function ($scope, $stateParams, $cookies, $state, ModelResource,
                                                     NotificationService) {

        $scope.model = getModelOnInit ();
        var editableFields = $scope.model.creationTool === 'Other' ?
            ['name', 'algorithm', 'description'] :
            'name';
        $scope.editable = _.pick($scope.model, editableFields);

        $scope.updateModelName = function () {
            ModelResource.updateModelMetadata($scope.model.id, $scope.editable)
                .then(function () {
                    NotificationService.success("Model Metadata has been updated");
                    $scope.goToModelsDetailsView();
                });
        };

        $scope.goToModelsDetailsView = function () {
            $state.go('app.modelcatalog.model', {modelId: $scope.model.id});
        };

        function getModelOnInit () {
            if (_.isEmpty($stateParams.model)) {
                return $cookies.getObject('model');
            }
            $cookies.putObject('model', $stateParams.model);
            return $stateParams.model;
        }
    });
}());