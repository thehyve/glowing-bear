"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Endpoint = (function () {
    function Endpoint(url) {
        this.url = url;
        this._isAuthenticated = false;
    }
    Endpoint.prototype.isAuthenticated = function () {
        return this._isAuthenticated;
    };
    Endpoint.prototype.setAccessToken = function (access_token) {
        this.access_token = access_token;
        this._isAuthenticated = true;
    };
    return Endpoint;
}());
exports.Endpoint = Endpoint;
