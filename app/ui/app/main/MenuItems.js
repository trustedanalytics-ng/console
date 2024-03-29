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
    App.value('MenuItems', [
        {
            "text": "Operations",
            "icon": "icon-puzzle",
            "items": [
                {
                    "text": "Platform Dashboard",
                    "sref": "app.platformdashboard"
                },
                {
                    "text": "Platform Tests",
                    "sref": "app.platformtests"
                },
                {
                    "text": "Version Tracking",
                    "sref": "app.versiontracking"
                }
            ],
            "access": ["admin"]
        },
        {
            "text": "Dashboard",
            "sref": "app.dashboard",
            "icon": "icon-speedometer"
        }, {
            "text": "Data Catalog",
            "sref": "app.datacatalog",
            "icon": "icon-folder-alt"
        }, {
            "text": "Model Catalog",
            "sref": "app.modelcatalog",
            "icon": "icon-folder-alt"
        }, {
            "text": "Job Scheduler",
            "icon": "icon-hourglass",
            "items": [
                {
                    "text": "Import Data",
                    "sref": "app.jobsscheduler.importdata"
                },
                {
                    "text": "Job Browser",
                    "sref": "app.jobsscheduler.jobs"
                },
                {
                    "text": "Hue Submission",
                    "visualization_tool": "hue-oozie-editor"
                }
            ]
        }, {
            "text": "Applications",
            "sref": "app.applications",
            "icon": "icon-grid"
        }, {
            "text": "Marketplace",
            "icon": "icon-bag",
            "items": [
                {
                    "text": "Services",
                    "sref": "app.marketplace.services"
                }, {
                    "text": "Instances",
                    "sref": "app.marketplace.instances"
                }
            ]
        }, {
            "text": "App Development",
            "icon": "fa-building",
            "sref": "app.development"
        },{
            "text": "Data Science",
            "id": "datascience",
            "icon": "icon-wrench",
            "items": [
                {
                    "text": "Seahorse",
                    "sref": "app.seahorse",
                    "tool": 'seahorse'
                }, {
                    "text": "IPython",
                    "sref": "app.ipython",
                    "tool": 'ipython'
                }, {
                    "text": "Jupyter",
                    "sref": "app.jupyter",
                    "tool": "jupyter"
                },  {
                    "text": "RStudio®",
                    "sref": "app.rstudio",
                    "tool": "rstudio"
                }, {
                    "text": "H2O",
                    "sref": "app.h2o-350",
                    "tool": "h2o-350"
                }, {
                    "text": "Apache Gearpump",
                    "sref": "app.gearpump-080",
                    "tool": "gearpump-080"
                }

            ]
        }, {
            "text": "User Management",
            "icon": "icon-people",
            "items": [
                {
                    "text": "Onboarding",
                    "sref": "app.manage.invite",
                    "access": ["admin"]
                }, {
                    "text": "Manage Organization Users",
                    "sref": "app.manage.orgusers",
                    "access": ["admin", "currentOrgManager"]
                }
            ],
            "access": ["admin", "anyOrgManager"]
        }
    ]);
})();
