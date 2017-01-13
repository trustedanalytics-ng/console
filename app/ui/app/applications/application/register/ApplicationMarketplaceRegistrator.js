/**
 * Copyright (c) 2017 Intel Corporation
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

    App.factory('ApplicationMarketplaceRegistrator', function (OfferingsResource, NotificationService) {
        return {
            getOfferingsOfApplication: function(appId) {
                return OfferingsResource
                    .withErrorMessage('Failed to retrieve service offerings')
                    .getAll()
                    .then(function (offerings) {
                        return _.filter(offerings, function(offering) {
                            return _.some(offering.metadata, {
                                key: 'APPLICATION_ID',
                                value: appId
                            });
                        });
                    });

            },

            registerApplication: function(offeringRequest) {
                return OfferingsResource
                    .withErrorMessage('Failed to register application in marketplace')
                    .createFromApplication(offeringRequest)
                    .then(function() {
                        NotificationService.success('Application has been registered in marketplace');
                    });
            }
        };
    });
})();