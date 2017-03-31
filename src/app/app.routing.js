"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var router_1 = require("@angular/router");
// Route Configuration
exports.routes = [
    {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
    },
    {
        path: 'dashboard',
        loadChildren: '/modules/dashboard/dashboard.module#DashboardModule'
    },
    {
        path: 'data-selection',
        loadChildren: './modules/data-selection/data-selection.module#DataSelectionModule'
    },
    {
        path: 'analysis',
        loadChildren: './modules/analysis/analysis.module#AnalysisModule'
    },
    {
        path: 'export',
        loadChildren: './modules/export/export.module#ExportModule'
    }
];
exports.routing = router_1.RouterModule.forRoot(exports.routes);
