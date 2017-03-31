"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var NavbarComponent = (function () {
    function NavbarComponent(router) {
        var _this = this;
        this.router = router;
        this.isDashboard = true;
        this.isDataSelection = false;
        this.isAnalysis = false;
        this.isExport = false;
        router.events.subscribe(function (event) {
            if (event instanceof router_1.NavigationEnd) {
                var whichStep = event.urlAfterRedirects.split('/')[1].split('#')[0];
                _this.updateNavbar(whichStep);
            }
        });
    }
    NavbarComponent.prototype.updateNavbar = function (whichStep) {
        console.log('whichstep: ', whichStep);
        this.isDashboard = (whichStep === 'dashboard');
        this.isDataSelection = (whichStep === 'data-selection');
        this.isAnalysis = (whichStep === 'analysis');
        this.isExport = (whichStep === 'export');
        // console.log('-- which step: ', whichStep);
        // console.log('isDashboard: ', this.isDashboard);
        // console.log('isDataSelection: ', this.isDataSelection);
        // console.log('isDataView: ', this.isDataView);
        // console.log('isAnalysis: ', this.isAnalysis);
        // console.log('isExport: ', this.isExport);
    };
    return NavbarComponent;
}());
NavbarComponent = __decorate([
    core_1.Component({
        selector: 'navbar',
        templateUrl: './navbar.component.html',
        styleUrls: ['./navbar.component.css']
    })
], NavbarComponent);
exports.NavbarComponent = NavbarComponent;
