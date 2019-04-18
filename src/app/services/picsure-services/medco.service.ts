/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2018 EPFL LCA1
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable, Injector} from '@angular/core';
import {AppConfig} from '../../config/app.config';
import {AggregateKeys, GenerateKeyPair, EncryptInt, DecryptInt} from '@medco/medco-unlynx-js'
import {HttpClient} from '@angular/common/http';
import {ErrorHelper} from '../../utilities/error-helper';
import {NavbarService} from "../navbar.service";
import {BehaviorSubject} from "rxjs";
import {MedcoNodeResult} from "../../models/picsure-models/i2b2-medco/medco-node-result";

// todo 12/04/19: delayed upgrade of medco-unlynx-js (stay with 0.1.8),
//  wait for bug fix of wasm go compiler (?) (changes marked XXX)

@Injectable()
export class MedcoService {

  private _results: BehaviorSubject<MedcoNodeResult[]>;

  private _publicKey: string;
  private privateKey: string;

  private cothorityKey: string;

  private navbarService: NavbarService;

  // private cryptoEngine: any; XXX

  /**
   * If the configuration key `medco-cothority-key-url` is present, the file will be fetched and the service enabled.
   * @param {AppConfig} config
   * @param http
   * @param injector
   */
  constructor(private config: AppConfig,
              private http: HttpClient,
              private injector: Injector) {
    this._results = new BehaviorSubject([]);

    // XXX
    // this.cryptoEngine = CryptoEngine;
    // this.cryptoEngine.Ready.then(() => {

      // fetch and load the cothority key
      let cothorityKeyUrl = config.getConfig('medco-cothority-key-url');
      if (cothorityKeyUrl) {
        this.http
          .get(cothorityKeyUrl, {responseType: 'text'})
          .subscribe((keyResp) => {
              this.cothorityKey = String(AggregateKeys(String(keyResp))); // XXX
              if (this.cothorityKey) {
                console.log(`Loaded the MedCo cothority key from ${cothorityKeyUrl}`);
              } else {
                ErrorHelper.handleError(`Failed to load the MedCo cothority key ${cothorityKeyUrl}`);
              }
            },
            (err) => ErrorHelper.handleError(err)
          );

        this.loadUserKeyPair();
      }
    // });
  }

  /**
   * Generates a random pair of keys for the user to be used during this instance.
   */
  loadUserKeyPair() {
    let keyPair = String(GenerateKeyPair()); // XXX
    [this.privateKey, this._publicKey] = keyPair.split(',', 2);
    console.log(`Generated the MedCo pair of keys (public: ${this.publicKey})`);
  }

  /**
   * Encrypts an integer with the cothority key (this is not the public key generated!).
   * @param {number} integer
   * @returns {string}
   */
  encryptInteger(integer: string): string {
    return EncryptInt(this.cothorityKey, integer); // XXX
  }

  /**
   * Decrypts an integer with the private key that was set.
   * @param {string} encInteger
   * @returns {number}
   */
  decryptInteger(encInteger: string): string {
    return DecryptInt(encInteger, this.privateKey); // XXX
  }

  /**
   * Parse the MedCo results coming from PIC-SURE, themselves coming from the MedCo cells.
   * Stores the breakdown by hospital and the other information.
   * Make available the "MedCo Results" tab in UI.
   *
   * @returns {number} the total number of matching patients.
   * @param results
   */
  parseMedCoResults(results: MedcoNodeResult[]): number {

    // k is 0, 1, 2, ....
    for (let k in results) {
      // let b64EncodedResultObject = data[k][`medco_results_${k}`];
      // let resultObject = JSON.parse(atob(b64EncodedResultObject));

      if (this.publicKey !== results[k].encryptionKey) {
        console.warn(`Returned public key is different from public key, expect problems (${results[k].encryptionKey})`);
      }

      results[k].nodeName = `Clinical Site ${k}`; // todo: get from node
      results[k].networkName = 'MedCo Network'; // todo: get from node
      results[k].decryptedCount = Number(this.decryptInteger(results[k].encryptedCount));
      results[k].timeMeasurements = {}; // todo

      // results.push(result);
      console.log(`${k}: ${results[k].decryptedCount}, times: ${JSON.stringify(results[k].timeMeasurements)}`)
    }

    // randomize results (according to configuration)
    let medcoResultsRandomization = this.config.getConfig('medco-results-randomization');
    if (medcoResultsRandomization) {
      results.forEach((res) =>
        res.decryptedCount += Math.floor(Math.random() * Number(medcoResultsRandomization))
      );
    }

    this.results.next(results);
    this.addMedcoResultsTab();

    return results.map((r) => r.decryptedCount).reduce((a, b) => Number(a) + Number(b));
  }

  /**
   * Add in UI the Medco Results tab to display data breakdown.
   */
  private addMedcoResultsTab() {
    if (!this.navbarService) {
      this.navbarService = this.injector.get(NavbarService);
    }

    if (!this.navbarService.items.find( (item) => item.routerLink == '/medco-results')) {
      this.navbarService.items.push({label: 'MedCo Results', routerLink: '/medco-results'});
    }
  }

  get results(): BehaviorSubject<MedcoNodeResult[]> {
    return this._results;
  }

  get publicKey(): string {
    return this._publicKey;
  }

}
