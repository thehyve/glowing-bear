/**
 * Copyright 2019  LDS EPFL
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable, Injector} from '@angular/core';
import {AppConfig} from '../../config/app.config';
import {Observable} from 'rxjs';
import {ApiEndpointService} from '../api-endpoint.service';
import {NetworkMetadata} from "../../models/api-response-models/medco-network/network-metadata";
import {NodeMetadata} from "../../models/api-response-models/medco-network/node-metadata";
import {ErrorHelper} from "../../utilities/error-helper";

@Injectable()
export class MedcoNetworkService {

  /**
   * Contains the network/cothority public key.
   */
  private _networkPubKey: string;

  /**
   * Contains the list of nodes and their metadata.
   */
  private _nodes: NodeMetadata[];

  private config: AppConfig;
  private apiEndpointService: ApiEndpointService;

  constructor(private injector: Injector) { }

  load(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.config = this.injector.get(AppConfig);
      this.apiEndpointService = this.injector.get(ApiEndpointService);

      this.getNetwork().subscribe((metadata: NetworkMetadata) => {
        this._networkPubKey = metadata['public-key'];
        this._nodes = metadata.nodes;
        console.log(`Loaded nodes: ${metadata.nodes.map((a) => a.name).join(', ')}`);
        resolve();

      }, (err) => {
        ErrorHelper.handleError(err);
        console.error("Failed to load network metadata");
        reject(err);
      });
    });
  }

  // ------------------- getters/setter ----------------------
  get networkPubKey(): string {
    return this._networkPubKey;
  }

  get nodes(): NodeMetadata[] {
    return this._nodes;
  }

  get nodesUrl(): string[] {
    return this._nodes.map((node) => node.url);
  }

  //  ------------------- others ----------------------

  /**
   * Returns the MedCo network metadata.
   * @returns {Observable<NetworkMetadata[]>}
   */
  getNetwork(): Observable<NetworkMetadata> {
    const urlPart = 'network';
    return this.apiEndpointService.getCall(urlPart, false);
  }
}
