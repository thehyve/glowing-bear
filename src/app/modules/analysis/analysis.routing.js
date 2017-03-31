"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var router_1 = require("@angular/router");
var analysis_component_1 = require("./analysis.component");
var routes = [
    { path: '', component: analysis_component_1.AnalysisComponent }
];
exports.routing = router_1.RouterModule.forChild(routes);
