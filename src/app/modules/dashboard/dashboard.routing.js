"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var router_1 = require("@angular/router");
var dashboard_component_1 = require("./dashboard.component");
var routes = [
    { path: '', component: dashboard_component_1.AnalysisComponent }
];
exports.routing = router_1.RouterModule.forChild(routes);
