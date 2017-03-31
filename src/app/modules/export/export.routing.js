"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var router_1 = require("@angular/router");
var export_component_1 = require("./export.component");
var routes = [
    { path: '', component: export_component_1.ExportComponent }
];
exports.routing = router_1.RouterModule.forChild(routes);
