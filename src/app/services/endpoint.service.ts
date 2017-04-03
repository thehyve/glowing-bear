import { Injectable } from '@angular/core';
import { Endpoint } from '../models/endpoint';
import { Location } from '@angular/common';

@Injectable()
export class EndpointService {

  private endpoint:Endpoint = new Endpoint('http://localhost:8080');

  constructor(private location:Location) {
    let parsedUrl = this.parseUrl(this.getCurrentUrl());
    let oauthGrantFragment:string = parsedUrl.hash;
    if (oauthGrantFragment.length > 1) {
      // Update the current endpoint with the received credentials and save it
      this.endpoint = this.initializeEndpointWithCredentials(
        this.endpoint,
        oauthGrantFragment
      );
    }

    if (!this.endpoint.access_token) {
      this.navigateToAuthorizationPage(this.endpoint);
    }
  }

  /**
   * Return the current url
   * @returns {string}
   */
  getCurrentUrl():string {
    return window.location.href;
  }

  /**
   * Navigates to the specified url
   * @param url
   */
  navigateToUrl(url:string) {
    window.location.href = url;
  }

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
  parseUrl(_url: string) {
    let url = this.location.normalize(_url);
    let arr = url.split('://');
    let protocol = arr[0];
    let tail = arr[1];
    arr = tail.split('#');
    let part = arr[0];
    let path = part.split('/')[1]||'';
    let hash = arr[1]||'';
    let host = part.split('/')[0].split(':')[0];
    let port = part.split(':')[1].split('/')[0];

    return {
      protocol: protocol,
      host: host,
      port: port,
      hash: hash,
      path: path
    }
  }

  public getEndpoint() {
    return this.endpoint;
  }

  /**
   * Navigate to the endpoint's authorization page.
   * @memberof EndpointService
   * @param endpoint
   */
  navigateToAuthorizationPage(endpoint) {

    // Cut off any '/'
    var url = endpoint.url;
    if (url.substring(url.length - 1, url.length) === '/') {
      url = url.substring(0, url.length - 1);
    }

    // Construct the redirect url
    var parsedUrl = this.parseUrl(this.getCurrentUrl());
    let redirectUri =
      this.getRedirectURI(parsedUrl.protocol,
        parsedUrl.host,
        parsedUrl.port,
        parsedUrl.path);

    var authorizationUrl = `${url}/oauth/authorize?response_type=token&client_id=glowingbear-js&redirect_uri=${redirectUri}`;
    this.navigateToUrl(authorizationUrl);
  }

  /**
   * Return redirect URI
   * @memberof EndpointService
   * @param port {string}
   * @param host {string}
   * @param protocol {string}
   * @param path {string}
   * @returns {string}
   */
  getRedirectURI(protocol, host, port, path) {
    if (['80', '443'].indexOf(port) >= 0) {
      port = '';
    } else {
      port = '%3A' + port;
    }
    let redirectUri = `${protocol}%3A%2F%2F${host}${port}`;
    return redirectUri;
  }

  /**
   * Sets up a new restangular instance using the specified credentials.
   * @memberof EndpointService
   * @param endpoint
   * @param oauthGrantFragment
   */
  initializeEndpointWithCredentials(endpoint, oauthGrantFragment) {
    endpoint = this.mergeEndpointCredentials(endpoint, oauthGrantFragment);
    var time = new Date();
    endpoint.expiresAt = time.setTime(time.getTime() + endpoint.expires_in * 1000);
    return endpoint;
  }

  /**
   * Returns endpoint with merged credentials extracted from URI.
   * @memberof EndpointService
   * @param endpoint
   * @param strFragment
   * @returns {*}
   */
  mergeEndpointCredentials(endpoint, strFragment) {
    var fragmentObj = JSON.parse('{"' +
      decodeURI(
        strFragment
          .replace(/&/g, "\",\"") // replace '&' with ','
          .replace(/=/g, "\":\"")) + '"}' // replace '=' with ':'
    );
    return Object.assign(fragmentObj, endpoint);
  }


}
