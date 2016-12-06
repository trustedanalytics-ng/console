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
App.config(function ($stateProvider, $urlRouterProvider, LazyLoadProvider, AppConfig, $sceProvider) {
    'use strict';

    // This is workaround for marketplace icons not loading
    $sceProvider.enabled(false);

    $urlRouterProvider.when('/app/datacatalog', '/app/datacatalog/datasets');
    $urlRouterProvider.when('/app/versiontracking', '/app/versiontracking/snapshots');
    $urlRouterProvider.when('/app/marketplace', '/app/marketplace/services');
    $urlRouterProvider.when('/app/modelcatalog', '/app/modelcatalog/models');
    $urlRouterProvider.when('/app/platformdashboard', '/app/platformdashboard/summary');
    $urlRouterProvider.when('/app/jobsscheduler/jobs', '/app/jobsscheduler/jobs/workflowjobs');

    $urlRouterProvider.when('/app/platformtests', '/app/platformtests/list');
    $urlRouterProvider.otherwise('/app/dashboard');

    $stateProvider
        .state('app', {
            url: '/app',
            abstract: true,
            templateUrl: getViewPath('main/app.html'),
            resolve: _.extend(LazyLoadProvider.load(['icons']), {
                orgs: /*@ngInject*/ function (targetProvider) {
                    return targetProvider.refresh()
                        .catch(function() {
                            // ignore error
                        });
                }
            })
        })
        .state('app.jobsscheduler', {
            url: '/jobsscheduler',
            abstract: true,
            template: '<ui-view />'
        })
        .state('app.jobsscheduler.importdata', {
            url: '/importdata',
            title: 'Import data scheduler',
            targetHeader: {org: true, space: false},
            controller: 'ImportDataController',
            templateUrl: getViewPath('jobsscheduler/importdata/importdata.html'),
            resolve: LazyLoadProvider.load(['bootstrap-datetimepicker', 'ngMessages'])
        })
        .state('app.jobsscheduler.jobs', {
            url: '/jobs',
            abstract: true,
            title: 'Jobs browser',
            controller: 'JobsBrowserController',
            templateUrl: getViewPath('jobsscheduler/jobs/jobsbrowser.html')
        })
        .state('app.jobsscheduler.jobs.workflowjobs', {
            url: '/workflowjobs',
            title: 'Workflow jobs',
            targetHeader: {org: true, space: false},
            controller: 'WorkflowJobsController',
            templateUrl: getViewPath('jobsscheduler/jobs/workflow/workflowjobs.html')
        })
        .state('app.jobsscheduler.workflowjob', {
            url: '/workflowjobs/:workflowjobId',
            title: 'Workflow job',
            targetHeader: {org: true, space: false},
            controller: 'WorkflowJobController',
            templateUrl: getViewPath('jobsscheduler/jobs/workflow/workflowjob.html')
        })
        .state('app.jobsscheduler.jobs.coordinatorjobs', {
            url: '/coordinatorjobs',
            title: 'Coordinator jobs',
            targetHeader: {org: true, space: false},
            controller: 'CoordinatorJobsController',
            templateUrl: getViewPath('jobsscheduler/jobs/coordinator/coordinatorjobs.html')
        })
        .state('app.jobsscheduler.coordinatorjob', {
            url: '/coordinatorjobs/:coordinatorjobId',
            title: 'Coordinator job',
            targetHeader: {org: true, space: false},
            controller: 'CoordinatorJobController',
            templateUrl: getViewPath('jobsscheduler/jobs/coordinator/coordinatorjob.html')
        })
        .state('app.platformdashboard', {
            url: '/platformdashboard',
            title: 'Platform Dashboard',
            controller: 'PlatformDashboardController',
            controllerAs: 'ctrl',
            templateUrl: getViewPath('operations/platformdashboard/platform-dashboard.html')
        })
        .state('app.platformdashboard.summary', {
            url: '/summary',
            title: 'Summary',
            targetHeader: {org: false, space: false},
            templateUrl: getViewPath('operations/platformdashboard/platform-summary.html')
        })
        .state('app.platformdashboard.kubernetes', {
            url: '/kubernetes',
            title: 'Kubernetes',
            targetHeader: {org: false, space: false},
            templateUrl: getViewPath('operations/platformdashboard/platform-kubernetes.html')
        })
        .state('app.versiontracking', {
            url: '/versiontracking',
            title: 'Version tracking',
            controller: 'VersionTrackingController',
            controllerAs: 'ctrl',
            templateUrl: getViewPath('operations/versiontracking/versiontracking.html')
        })
        .state('app.versiontracking.snapshots', {
            url: '/snapshots',
            title: 'Snapshots',
            controller: 'PlatformSnapshotsController',
            controllerAs: 'ctrl',
            templateUrl: getViewPath('operations/versiontracking/platformsnapshots/platformsnapshots.html')
        })
        .state('app.versiontracking.diffs', {
            url: '/diffs',
            title: 'Snapshots diffs',
            controller: 'PlatformSnapshotsDiffsController',
            controllerAs: 'ctrl',
            templateUrl: getViewPath('operations/versiontracking/diffs/platformsnapshotsdiffs.html')
        })
        .state('app.versiontrackingapp', {
            url: '/versiontracking/snapshots/:snapshotId/:appGuid',
            title: 'Application details',
            controller: 'ApplicationOverviewController',
            templateUrl: getViewPath('operations/versiontracking/platformsnapshots/appoverview.html')
        })
        .state('app.platformtests', {
            url: '/platformtests',
            title: 'Platform Test Suites',
            templateUrl: getViewPath('operations/platformtests/platform-tests.html')
        })
        .state('app.platformtests.list', {
            url: '/list',
            title: 'Platform Test Suites',
            controller: 'PlatformTestSuitesController',
            controllerAs: 'ctrl',
            templateUrl: getViewPath('operations/platformtests/test-suites.html')
        })
        .state('app.platformtests.results', {
            url: '/results/:testSuiteId',
            title: 'Platform Test Suite Results',
            controller: 'PlatformTestSuiteResultsController',
            controllerAs: 'ctrl',
            templateUrl: getViewPath('operations/platformtests/test-suite-results.html')
        })
        .state('app.dashboard', {
            url: '/dashboard',
            title: 'Dashboard',
            targetHeader: {org: true, space: false},
            controller: 'DashboardController',
            templateUrl: getViewPath('dashboard/dashboard.html'),
            resolve: LazyLoadProvider.load(['c3charts-serial'])
        })
        .state('app.latestevents', {
            url: '/events',
            targetHeader: {org: true, space: false},
            controller: 'LatestEventsController',
            templateUrl: getViewPath('latestevents/events.html')
        })
        .state('app.marketplace', {
            url: '/marketplace',
            abstract: true,
            template: '<ui-view />'
        })
        .state('app.marketplace.services', {
            url: '/services',
            title: 'Services',
            targetHeader: {org: true, space: true},
            controller: 'ServicesController',
            controllerAs: 'ctrl',
            resolve: LazyLoadProvider.load(['dibari.angular-ellipsis']),
            templateUrl: getViewPath('marketplace/list/services.html'),

            searchEnabled: true
        })
        .state('app.marketplace.instances', {
            url: '/instances',
            title: 'Service instances',
            targetHeader: {org: true, space: true},
            controller: 'ServiceInstancesListController',
            templateUrl: getViewPath('marketplace/instances/list.html')
        })
        .state('app.marketplace.instance', {
            url: '/instance/:instanceId',
            title: 'Service instance details',
            targetHeader: {org: false, space: false},
            controller: 'ServiceInstanceDetailsController',
            templateUrl: getViewPath('marketplace/instances/instance-details.html')
        })
        .state('app.service', {
            url: '/service/:serviceId',
            title: 'Service',
            targetHeader: {org: true, space: true},
            controller: 'ServiceController',
            controllerAs: 'ctrl',
            templateUrl: getViewPath('marketplace/service/service.html'),
            resolve: LazyLoadProvider.load(['ngMessages'])
        })
        .state('app.applications', {
            url: '/applications',
            title: 'Applications',
            targetHeader: {org: true, space: true},
            controller: 'ApplicationsController',
            controllerAs: 'ctrl',
            templateUrl: getViewPath('applications/list/apps.html')
        })
        .state('app.application', {
            url: '/application/:appId',
            title: 'Application',
            targetHeader: {org: false, space: false},
            controller: 'ApplicationController',
            controllerAs: 'appCtrl',
            templateUrl: getViewPath('applications/application/application.html')
        })
        .state('app.application.overview', {
            url: '/overview',
            title: 'Application',
            targetHeader: {org: false, space: false},
            templateUrl: getViewPath('applications/application/overview/overview.html')
        })
        .state('app.application.bindings', {
            url: '/bindings',
            title: 'Application',
            targetHeader: {org: false, space: false},
            controller: 'ApplicationBindingsController',
            controllerAs: 'bindCtrl',
            templateUrl: getViewPath('applications/application/bindings/bindings.html')
        })
        .state('app.application.register', {
            url: '/register',
            title: 'Application',
            targetHeader: {org: false, space: false},
            controller: 'ApplicationRegisterController',
            templateUrl: getViewPath('applications/application/register/register.html')
        })
        .state('app.development', {
            url: '/development',
            title: 'App Development',
            targetHeader: {org: false, space: false},
            controller: 'AppDevelopmentController',
            controllerAs: 'ctrl',
            templateUrl: getViewPath('tools/app-development.html')
        })
        .state('app.ipython', {
            url: '/ipython',
            title: 'IPython console',
            targetHeader: {org: true, space: true},
            entityDisplayName: 'IPython',
            controller: 'ToolsInstancesListController',
            templateUrl: getViewPath('tools/toolsInstancesList.html'),
            resolve: LazyLoadProvider.load(['ngMessages'])
        })
        .state('app.rstudio', {
            url: '/rstudio',
            title: 'RStudio®',
            targetHeader: {org: true, space: true},
            entityDisplayName: 'RStudio®',
            controller: 'ToolsInstancesListController',
            templateUrl: getViewPath('tools/toolsInstancesList.html'),
            resolve: LazyLoadProvider.load(['ngMessages'])
        })
        .state('app.seahorse', {
            url: '/seahorse',
            title: 'Seahorse',
            targetHeader: {org: true, space: true},
            entityDisplayName: 'Seahorse',
            controller: 'ToolsInstancesListController',
            templateUrl: getViewPath('tools/toolsInstancesList.html'),
            resolve: LazyLoadProvider.load(['ngMessages'])
        })
        .state('app.h2o-350', {
            url: '/h2o-350',
            title: 'H2O UI',
            targetHeader: {org: true, space: true},
            entityDisplayName: 'H2O',
            controller: 'ToolsInstancesListController',
            templateUrl: getViewPath('tools/toolsInstancesList.html'),
            resolve: LazyLoadProvider.load(['ngMessages'])
        })
        .state('app.gearpump-080', {
            url: '/gearpump-080',
            title: 'Apache Gearpump',
            targetHeader: {org: true, space: true},
            entityDisplayName: 'Apache Gearpump',
            controller: 'ToolsInstancesListController',
            templateUrl: getViewPath('tools/gearpumpInstancesList.html'),
            resolve: LazyLoadProvider.load(['ngMessages'])
        })
        .state('app.jupyter', {
            url: '/jupyter',
            title: 'Jupyter',
            targetHeader: {org: true, space: true},
            entityDisplayName: 'Jupyter',
            controller: 'ToolsInstancesListController',
            templateUrl: getViewPath('tools/toolsInstancesList.html'),
            resolve: LazyLoadProvider.load(['ngMessages'])
        })
        .state('app.gearpumpappdeploy', {
            url: '/gearpumpappdeploy/:instanceId',
            title: 'Apache Gearpump App Deploy',
            targetHeader: {org: false, space: false},
            controller: 'GearPumpAppDeployController',
            templateUrl: getViewPath('tools/gearpumpAppDeploy.html'),
            resolve: LazyLoadProvider.load(['ng-file-upload'])
        })
        .state('app.datacatalog', {
            url: '/datacatalog',
            controller: 'DataCatalogController',
            controllerAs: 'ctrl',
            templateUrl: getViewPath('datacatalog/datacatalog.html')
        })
        .state('app.datacatalog.datasets', {
            url: '/datasets',
            title: 'Data sets',
            targetHeader: {org: true, space: false},
            controller: 'DataSetsController',
            controllerAs: 'ctrl',
            templateUrl: getViewPath('datacatalog/datasets/datasets.html'),
            resolve: LazyLoadProvider.load(['bootstrap-datetimepicker','dibari.angular-ellipsis']),
            searchEnabled: true
        })
        .state('app.dataset', {
            url: '/dataset/:datasetId',
            title: 'Data set',
            targetHeader: {org: false, space: false},
            controller: 'DataSetController',
            controllerAs: 'ctrl',
            templateUrl: getViewPath('datacatalog/datasets/dataset.html'),
            resolve: LazyLoadProvider.load(['xeditable'])
        })
        .state('app.datacatalog.transfers', {
            url: '/transfers',
            title: 'Data transfers',
            targetHeader: {org: true, space: false},
            controller: 'DataSetTransferListController',
            controllerAs: 'ctrl',
            templateUrl: getViewPath('datacatalog/transfers/transfers.html')
        })
        .state('app.datacatalog.upload', {
            url: '/upload',
            title: 'Upload a dataset',
            targetHeader: {org: true, space: false},
            controller: 'UploadDataSetController',
            controllerAs: 'ctrl',
            templateUrl: getViewPath('datacatalog/transfers/upload.html'),
            resolve: LazyLoadProvider.load(['ng-file-upload'])
        })
        .state('app.modelcatalog', {
            url: '/modelcatalog',
            abstract: true,
            template: '<ui-view />'
        })
        .state('app.modelcatalog.models', {
            url: '/models',
            targetHeader: {org: true, space: false},
            controller: 'ModelsController',
            controllerAs: 'ctrl',
            templateUrl: getViewPath('modelcatalog/modelcatalog.html')
        })
        .state('app.modelcatalog.model', {
            url: '/model/:modelId',
            targetHeader: {org: true, space: false},
            controller: 'ModelsDetailsController',
            controllerAs: 'ctrl',
            templateUrl: getViewPath('modelcatalog/model-details.html'),
            resolve: LazyLoadProvider.load(['xeditable', 'ng-file-upload'])
        })
        .state('app.modelcatalog.upload', {
            url: '/upload',
            targetHeader: {org: true, space: false},
            controller: 'ModelUploadController',
            controllerAs: 'ctrl',
            templateUrl: getViewPath('modelcatalog/model-upload.html'),
            resolve: LazyLoadProvider.load(['ng-file-upload'])
        })
        //.state('app.modelcatalog.edit', {
        //    url: '/edit/model/:modelId',
        //    params: {
        //        model: {}
        //    },
        //    targetHeader: {org: true, space: false},
        //    controller: 'ModelsEditController',
        //    controllerAs: 'ctrl',
        //    templateUrl: getViewPath('modelcatalog/model-edit.html'),
        //
        //})
        .state('app.manage', {
            url: '/manage',
            abstract: true,
            template: '<ui-view />'
        })
        .state('app.manage.invite', {
            url: '/invite',
            title: 'Invitations',
            controller: 'InvitationsController',
            controllerAs: 'ctrl',
            abstract: true,
            templateUrl: getViewPath('manageusers/invite/invitations.html')
        })
        .state('app.manage.invite.send', {
            url: '/send',
            title: 'Invite new user',
            targetHeader: {org: false, space: false},
            controller: 'InvitationSendController as ctrl',
            templateUrl: getViewPath('manageusers/invite/invite.html')
        })
        .state('app.manage.invite.pending', {
            url: '/pending',
            title: 'Pending',
            targetHeader: {org: false, space: false},
            controller: 'PendingInvitationsController as ctrl',
            templateUrl: getViewPath('manageusers/invite/pending.html')
        })
        .state('app.manage.orgusers', {
            url: '/orgusers',
            title: 'Manage users in your organization',
            targetHeader: {org: true, space: false, managedOnly: true},
            controller: 'ManageUsersController',
            controllerAs: 'ctrl',
            templateUrl: getViewPath('manageusers/users/user.html')
        })
        .state('app.manage.organizations', {
            url: '/organizations',
            title: 'Organizations',
            controller: 'OrganizationsController',
            controllerAs: 'ctrl',
            templateUrl: getViewPath('manageusers/organizations/organizations.html')
        })
        .state('app.manage.organizations.manage', {
            url: '/manageorganizations/:orgId',
            title: 'Manage organizations',
            targetHeader: {org: false, space: false},
            controller: 'ManageOrganizationsController',
            controllerAs: 'ctrl',
            templateUrl: getViewPath('manageusers/organizations/manageorganizations.html'),
            resolve: LazyLoadProvider.load(['xeditable'])
        })
        .state('app.manage.organizations.add', {
            url: '/addorganization',
            title: 'Add organization',
            targetHeader:{org: true, space: true},
            controller: 'AddOrganizationsController',
            controllerAs: 'ctrl',
            templateUrl: getViewPath('manageusers/organizations/addorganization.html'),
            resolve: LazyLoadProvider.load(['parsley'])
        })
        .state('app.changepassword', {
            url: '/changepassword',
            title: 'Change password',
            targetHeader: {org: false, space: false},
            controller: 'ChangePasswordController',
            templateUrl: getViewPath('changepassword/changepassword.html'),
            resolve: LazyLoadProvider.load(['parsley'])
        })
        .state('app.version', {
            url: '/platformversion',
            title: 'Platform Version',
            controller: 'VersionController',
            controllerAs: 'ctrl',
            templateUrl: getViewPath('version/version.html')
        })
        .state('app.terms', {
            url: '/termsofuse',
            title: 'Terms of Use',
            targetHeader: {org: false, space: false},
            templateUrl: getViewPath('legal/termsOfUse.html'),
            resolve: LazyLoadProvider.load(['parsley'])
        })
        .state('app.disclaimers', {
            url: '/disclaimers',
            title: 'Disclaimers',
            targetHeader: {org: false, space: false},
            controller: 'DisclaimersController',
            templateUrl: getViewPath('legal/disclaimers.html')
        })
        .state('app.loading', {
            url: '/loading',
            title: 'Loading data',
            templateUrl: getViewPath('main/loading.html')
        })
        .state('app.documentation', {
            url: '/documentation',
            title: 'Documentation',
            controller: 'DocumentationController',
            targetHeader: {org: false, space: false},
            templateUrl: getViewPath('documentation/documentation.html')
        });

    function getViewPath(path) {
        return AppConfig.viewsBase + path;
    }
});
