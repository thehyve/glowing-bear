"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var router_1 = require("@angular/router");
var data_selection_component_1 = require("./data-selection.component");
var routes = [
    { path: '', component: data_selection_component_1.DataSelectionComponent }
];
exports.routing = router_1.RouterModule.forChild(routes);
