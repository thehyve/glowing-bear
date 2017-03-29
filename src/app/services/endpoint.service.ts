import { Injectable } from '@angular/core';
import {Endpoint} from "../models/endpoint";
import {Location} from '@angular/common';

@Injectable()
export class EndpointService {

  private endpoint:Endpoint = new Endpoint('http://localhost:8080');
  private location:Location;

  constructor(location:Location) {
    this.location = location;

    // Check if there is an OAuth fragment, which indicates we're in the process
    // of authorizing an endpoint.
    var parsedUrl = this.parseUrl(this.location.prepareExternalUrl(this.location.path(true)));
    var oauthGrantFragment:string = parsedUrl.hash;
    if (oauthGrantFragment.length > 1) {
      // Update the current endpoint with the received credentials and save it
      this.endpoint = this.initializeEndpointWithCredentials(
        this.endpoint,
        oauthGrantFragment
      );

      //$location.url($location.path());
    }

    if (!this.endpoint.access_token) {
      this.navigateToAuthorizationPage(this.endpoint);
    }

  }

  parseUrl(url: string) {
    console.log('hi');
    let arr = url.split('://');
    let protocol = arr[0];
    let tail = arr[1];
    arr = tail.split('#');
    let path = arr[0];
    let hash = arr[1];
    let host = path.split('/')[0];
    let port = path.split(':')[1];
    return {
      protocol: protocol,
      host: host,
      port: port,
      hash: hash
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
    var parsedUrl = this.parseUrl(endpoint.url);
    var currentHost = String(parsedUrl.host),
      currentPort = String(parsedUrl.port),
      currentProtocol = parsedUrl.protocol;

    // Cut off any '/'
    var url = endpoint.url;
    if (url.substring(url.length - 1, url.length) === '/') {
      url = url.substring(0, url.length - 1);
    }

    var authorizationUrl = url +
      '/oauth/authorize?response_type=token&client_id=glowingbear-js&redirect_uri=' +
      this.getRedirectURI(currentProtocol, currentHost, currentPort);

    this.location.go(authorizationUrl, '_self');
  }

  /**
   * Return redirect URI
   * @memberof EndpointService
   * @param port {string}
   * @param host {string}
   * @param protocol {string}
   * @returns {string}
   */
  getRedirectURI(protocol, host, port) {
    if (['80', '443'].indexOf(port) >= 0) {
      port = '';
    } else {
      port = '%3A' + port;
    }
    return protocol + '%3A%2F%2F' + host + port + '%2Fconnections';
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
