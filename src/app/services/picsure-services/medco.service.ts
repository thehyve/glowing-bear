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
import {GenerateKeyPair, AgggregateKeys, EncryptInt, DecryptInt} from '@medco/medco-unlynx-js'
import {HttpClient} from '@angular/common/http';
import {ErrorHelper} from '../../utilities/error-helper';
import {NavbarService} from "../navbar.service";
import {BehaviorSubject} from "rxjs";
import {MedcoResult} from "../../models/picsure-models/medco-result";

@Injectable()
export class MedcoService {

  private _results: BehaviorSubject<MedcoResult[]>;

  private _publicKey: string;
  private privateKey: string;

  private cothorityKey: string;

  private navbarService: NavbarService;

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

    // fetch and load the cothority key
    let cothorityKeyUrl = config.getConfig('medco-cothority-key-url');
    if (cothorityKeyUrl) {
      this.http
        .get(cothorityKeyUrl, {responseType: 'text'})
        .subscribe((keyResp) => {
          this.cothorityKey = AgggregateKeys(String(keyResp));
          console.log(this.cothorityKey);
          if (this.cothorityKey) {
            console.log(`Loaded the MedCo cothority key ${cothorityKeyUrl}`);
          } else {
            throw new Error(`Failed to load the MedCo cothority key ${cothorityKeyUrl}`);
          }
        },
        (err) => ErrorHelper.handleError(err)
        );

      this.loadUserKeyPair();
    }
  }

  /**
   * Generates a random pair of keys for the user to be used during this instance.
   */
  loadUserKeyPair() {
    [this._publicKey, this.privateKey] = GenerateKeyPair();
    console.log(`Generated the MedCo pair of keys (public: -- ${this._publicKey})`);
  }

  /**
   * Encrypts an integer with the cothority key (this is not the public key generated!).
   * @param {number} integer
   * @returns {string}
   */
  encryptInteger(integer: string): string {
    return EncryptInt(this.cothorityKey, integer);
  }

  /**
   * Decrypts an integer with the private key that was set.
   * @param {string} encInteger
   * @returns {number}
   */
  decryptInteger(encInteger: string): string {
    return DecryptInt(encInteger, this.privateKey);
  }

  /**
   * Parse the MedCo results coming from PIC-SURE, themselves coming from the MedCo cells.
   * Stores the breakdown by hospital and the other information.
   * Make available the "MedCo Results" tab in UI.
   *
   * @param {object} data the PIC-SURE data object
   * @returns {number} the total number of matching patients.
   */
  parseMedCoResults(data: object): number {
    let results: MedcoResult[] = [];

    // k is 0, 1, 2, ....
    for (let k in data) {
      let b64EncodedResultObject = data[k][`medco_results_${k}`];
      let resultObject = JSON.parse(atob(b64EncodedResultObject));

      if (this._publicKey !== resultObject['pub_key']) {
        console.warn(`Returned public key is different from public key, expect problems (${resultObject['pub_key']})`);
      }

      let result: MedcoResult = {
        siteName: `Clinical Site ${k}`,
        encryptedSubjectCount: resultObject['enc_count_result'],
        publicKey: resultObject['pub_key'],
        subjectCount: Number(this.decryptInteger(resultObject['enc_count_result'])),
        times: resultObject['times']
      };

      results.push(result);
      console.log(`${k}: ${result.subjectCount}, times: ${JSON.stringify(result.times)}`)
    }

    this.results.next(results);
    this.addMedcoResultsTab();

    return results.map((r) => r.subjectCount).reduce((a, b) => Number(a) + Number(b));
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

  get results(): BehaviorSubject<MedcoResult[]> {
    return this._results;
  }

  get publicKey(): string {
    return this._publicKey;
  }

}
