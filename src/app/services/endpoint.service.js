"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var endpoint_1 = require("../models/endpoint");
var EndpointService = (function () {
    function EndpointService(location) {
        this.location = location;
        this.endpoint = new endpoint_1.Endpoint('http://localhost:8080');
        var parsedUrl = this.parseUrl(this.getCurrentUrl());
        var oauthGrantFragment = parsedUrl.hash;
        if (oauthGrantFragment.length > 1) {
            // Update the current endpoint with the received credentials and save it
            this.endpoint = this.initializeEndpointWithCredentials(this.endpoint, oauthGrantFragment);
        }
        if (!this.endpoint.access_token) {
            this.navigateToAuthorizationPage(this.endpoint);
        }
    }
    /**
     * Return the current url
     * @returns {string}
     */
    EndpointService.prototype.getCurrentUrl = function () {
        return window.location.href;
    };
    /**
     * Navigates to the specified url
     * @param url
     */
    EndpointService.prototype.navigateToUrl = function (url) {
        window.location.href = url;
    };
    /**
     * Parse the url into protocol, host, port and hash, e.g.
     * {
     *   protocol: 'http',
     *   host: 'localhost',
     *   port: '4200',
     *   hash: ''
     * }
     * @param _url
     * @returns {{protocol: string, host: string, port: string, hash: (string|string), path: (string|string)}}
     */
    EndpointService.prototype.parseUrl = function (_url) {
        var url = this.location.normalize(_url);
        var arr = url.split('://');
        var protocol = arr[0];
        var tail = arr[1];
        arr = tail.split('#');
        var part = arr[0];
        var path = part.split('/')[1] || '';
        var hash = arr[1] || '';
        var host = part.split('/')[0].split(':')[0];
        var port = part.split(':')[1].split('/')[0];
        return {
            protocol: protocol,
            host: host,
            port: port,
            hash: hash,
            path: path
        };
    };
    EndpointService.prototype.getEndpoint = function () {
        return this.endpoint;
    };
    /**
     * Navigate to the endpoint's authorization page.
     * @memberof EndpointService
     * @param endpoint
     */
    EndpointService.prototype.navigateToAuthorizationPage = function (endpoint) {
        // Cut off any '/'
        var url = endpoint.url;
        if (url.substring(url.length - 1, url.length) === '/') {
            url = url.substring(0, url.length - 1);
        }
        // Construct the redirect url
        var parsedUrl = this.parseUrl(this.getCurrentUrl());
        var redirectUri = this.getRedirectURI(parsedUrl.protocol, parsedUrl.host, parsedUrl.port, parsedUrl.path);
        var authorizationUrl = url + "/oauth/authorize?response_type=token&client_id=glowingbear-js&redirect_uri=" + redirectUri;
        this.navigateToUrl(authorizationUrl);
    };
    /**
     * Return redirect URI
     * @memberof EndpointService
     * @param port {string}
     * @param host {string}
     * @param protocol {string}
     * @param path {string}
     * @returns {string}
     */
    EndpointService.prototype.getRedirectURI = function (protocol, host, port, path) {
        if (['80', '443'].indexOf(port) >= 0) {
            port = '';
        }
        else {
            port = '%3A' + port;
        }
        var redirectUri = protocol + "%3A%2F%2F" + host + port;
        return redirectUri;
    };
    /**
     * Sets up a new restangular instance using the specified credentials.
     * @memberof EndpointService
     * @param endpoint
     * @param oauthGrantFragment
     */
    EndpointService.prototype.initializeEndpointWithCredentials = function (endpoint, oauthGrantFragment) {
        endpoint = this.mergeEndpointCredentials(endpoint, oauthGrantFragment);
        var time = new Date();
        endpoint.expiresAt = time.setTime(time.getTime() + endpoint.expires_in * 1000);
        return endpoint;
    };
    /**
     * Returns endpoint with merged credentials extracted from URI.
     * @memberof EndpointService
     * @param endpoint
     * @param strFragment
     * @returns {*}
     */
    EndpointService.prototype.mergeEndpointCredentials = function (endpoint, strFragment) {
        var fragmentObj = JSON.parse('{"' +
            decodeURI(strFragment
                .replace(/&/g, "\",\"") // replace '&' with ','
                .replace(/=/g, "\":\"")) + '"}' // replace '=' with ':'
        );
        return Object.assign(fragmentObj, endpoint);
    };
    return EndpointService;
}());
EndpointService = __decorate([
    core_1.Injectable()
], EndpointService);
exports.EndpointService = EndpointService;
