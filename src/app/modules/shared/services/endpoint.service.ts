import {Injectable} from '@angular/core';
import {Endpoint} from '../models/endpoint';
import {AppConfig} from "../../../config/app.config";

@Injectable()
export class EndpointService {

  private endpoint: Endpoint;

  constructor(private appConfig: AppConfig) { console.log('endpoint service start...');
    let apiUrl = appConfig.getConfig('api-url');
    let apiVersion = appConfig.getConfig('api-version');
    let appUrl = appConfig.getConfig('app-url');
    this.endpoint = new Endpoint(apiUrl, apiVersion, appUrl);
    let parsedUrl = this.parseUrl(this.getCurrentUrl());
    // Check if there is authentication data in the hash fragment of the url
    let oauthGrantFragment: string = parsedUrl.hash;
    if (oauthGrantFragment.length > 1) {
      // Update the current endpoint with the received credentials
      this.initializeEndpointWithCredentials(this.endpoint, oauthGrantFragment);
      // Save the endpoint
      this.saveEndpoint();
    }
    else {
      this.restoreEndpoint();
    }

  }

  public getEndpoint() {
    return this.endpoint;
  }

  /**
   * Removes the currently held token and navigates to the authorization page
   * to get a new one.
   */
  invalidateToken() {
    this.endpoint.accessToken = '';
    this.saveEndpoint();
    this.navigateToAuthorizationPage(this.endpoint);
  }

  /**
   * Return the current url
   * @returns {string}
   */
  private getCurrentUrl(): string {
    return window.location.href;
  }

  /**
   * Navigates to the specified url
   * @param url
   */
  private navigateToUrl(url: string) {
    window.location.href = url;
  }

  /**
   * Parse the url into its elements
   * @param url
   * @returns {}
   */
  private parseUrl(url: string) {
    var match = url.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)#?(.*)$/);
    return match && {
        href: url,
        protocol: match[1],
        host: match[2],
        hostname: match[3],
        port: match[4],
        path: match[5],
        search: match[6],
        hash: match[7]
      };
  }

  /**
   * Navigate to the endpoint's authorization page.
   * @param endpoint
   */
  private navigateToAuthorizationPage(endpoint) {

    // Cut off any '/'
    let apiUrl = endpoint.apiUrl;
    let appUrl = endpoint.appUrl;
    if (apiUrl.substring(apiUrl.length - 1, apiUrl.length) === '/') {
      apiUrl = apiUrl.substring(0, apiUrl.length - 1);
    }
    if (appUrl.substring(appUrl.length - 1, appUrl.length) === '/') {
      appUrl = appUrl.substring(0, appUrl.length - 1);
    }

    var authorizationUrl = `${apiUrl}/oauth/authorize?response_type=token&client_id=glowingbear-js&redirect_uri=${appUrl}`;
    this.navigateToUrl(authorizationUrl);
  }

  /**
   * Return URI-encoded redirect URI that can be used as a parameter in a url
   * @param port {string}
   * @param host {string}
   * @param protocol {string}
   * @param path {string}
   * @returns {string}
   */
  private getRedirectURI(protocol, host, port, path) {
    let redirectUri;
    if (port) {
      if (['80', '443'].indexOf(port) >= 0) {
        port = '';
      } else {
        port = ':' + port;
      }
      redirectUri = `${protocol}//${host}${port}`;
    }
    else {
      redirectUri = `${protocol}//${host}`;
    }

    return encodeURIComponent(redirectUri);
  }

  /**
   * Sets up a new restangular instance using the specified credentials.
   * @param endpoint
   * @param oauthGrantFragment
   */
  private initializeEndpointWithCredentials(endpoint, oauthGrantFragment) {
    var fragmentParams = this.getFragmentParameters(oauthGrantFragment);
    endpoint.accessToken = fragmentParams.access_token;
    var time = new Date();
    endpoint.expiresAt = time.setTime(time.getTime() + fragmentParams.expires_in * 1000);
  }

  /**
   * Returns the parsed fragment parameters as an object
   * @param fragment
   * @returns {*}
   */
  private getFragmentParameters(fragment: string) {
    return JSON.parse('{"' +
      decodeURI(
        fragment
          .replace(/&/g, "\",\"") // replace '&' with ','
          .replace(/=/g, "\":\"")) + '"}' // replace '=' with ':'
    );
  }

  /**
   * Saves the endpoint to local storage.
   */
  private saveEndpoint() {
    localStorage.setItem('endpoint', JSON.stringify(this.endpoint));
  }

  /**
   * Restores the endpoint from local storage, or navigates to the
   * authorization page is no data is found.
   */
  private restoreEndpoint() {
    let endpointJSON = localStorage.getItem('endpoint');
    if (endpointJSON) {
      Object.assign(this.endpoint, JSON.parse(endpointJSON));
    }
    else {
      this.navigateToAuthorizationPage(this.endpoint);
    }
  }

}
