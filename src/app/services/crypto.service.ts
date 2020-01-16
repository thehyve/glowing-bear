/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2018 EPFL LCA1
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable, Injector} from '@angular/core';
import {AppConfig} from '../config/app.config';
//import {AggregateKeys, GenerateKeyPair, EncryptInt, DecryptInt} from '@medco/medco-unlynx-js'
import {HttpClient} from '@angular/common/http';
import {MedcoNetworkService} from "./api/medco-network.service";

// todo 12/04/19: delayed upgrade of medco-unlynx-js (stay with 0.1.8),
//  wait for bug fix of wasm go compiler (?) (changes marked XXX)

// todo: joao is reimplementing all this with new kyber npm package

@Injectable()
export class CryptoService {

  private _ephemeralPublicKey: string;
  private ephemeralPrivateKey: string;

  // private cryptoEngine: any; XXX

  /**
   * If the configuration key `medco-cothority-key-url` is present, the file will be fetched and the service enabled.
   * @param {AppConfig} config
   * @param http
   * @param medcoNetworkService
   */
  constructor(private config: AppConfig,
              private http: HttpClient,
              private medcoNetworkService: MedcoNetworkService) {
    this.loadUserKeyPair();
  }

  /**
   * Generates a random pair of keys for the user to be used during this instance.
   */
  private loadUserKeyPair() {
    // let keyPair = String(GenerateKeyPair()); // XXX
    // [this.ephemeralPrivateKey, this._ephemeralPublicKey] = keyPair.split(',', 2);
    console.log(`Generated the MedCo pair of keys (public: ${this.ephemeralPublicKey})`);
  }

  /**
   * Encrypts an integer with the cothority key (this is not the public key generated!).
   * @param {number} integer
   * @returns {string}
   */
  encryptInteger(integer: number): string {
    return ""; //EncryptInt(this.cothorityKey, integer); // XXX
  }

  /**
   * Decrypts an integer with the private key that was set.
   * @param {string} encInteger
   * @returns {number}
   */
  decryptInteger(encInteger: string): number {
    // return DecryptInt(encInteger, this.ephemeralPrivateKey); // XXX
    return 0;
  }

  /**
   * Parse the MedCo results coming from PIC-SURE, themselves coming from the MedCo cells.
   * Stores the breakdown by hospital and the other information.
   * Make available the "MedCo Results" tab in UI.
   *
   * @returns {number} the total number of matching patients.
   * @param results
   */
  // parseMedCoResults(results: ExploreQueryResult[]): number {
  //
  //   for (let k in results) {
  //
  //     if (this.ephemeralPublicKey !== results[k].encryptionKey) {
  //       console.warn(`Returned public key is different from public key, expect problems (${results[k].encryptionKey})`);
  //     }
  //
  //     results[k].nodeName = `Clinical Site ${k}`; // todo: get from node
  //     results[k].networkName = 'MedCo Network'; // todo: get from node
  //     results[k].timeMeasurements = {}; // todo
  //
  //     // decrypt count
  //     results[k].decryptedCount = Number(this.decryptInteger(results[k].encryptedCount));
  //
  //     // decrypt patient list, ignore IDs that are zero (= dummies nullified)
  //     results[k].decryptedPatientList = results[k].encryptedPatientList?
  //       results[k].encryptedPatientList
  //         .map((encId) => Number(this.decryptInteger(encId)))
  //         .filter((pId) => pId !== 0):
  //       [];
  //
  //     // parse query type
  //     results[k].parsedQueryType = QueryType.ALL_TYPES.find((type) => type.id === results[k].queryType);
  //
  //     console.log(`${k}: count=${results[k].decryptedCount}, #patient IDs=${results[k].decryptedPatientList.length}, times: ${JSON.stringify(results[k].timeMeasurements)}`)
  //   }
  //
  //   // randomize results (according to configuration)
  //   let medcoResultsRandomization = this.config.getConfig('medco-results-randomization');
  //   if (medcoResultsRandomization) {
  //     results.forEach((res) =>
  //       res.decryptedCount += Math.floor(Math.random() * Number(medcoResultsRandomization))
  //     );
  //   }
  //
  //   this.results.next(results);
  //
  //   if (results[0].parsedQueryType === QueryType.COUNT_GLOBAL ||
  //     results[0].parsedQueryType === QueryType.COUNT_GLOBAL_OBFUSCATED) {
  //     // count is global: all results should be the same, return the first one
  //     return results[0].decryptedCount;
  //   } else {
  //     this.addMedcoResultsTab();
  //     return results.map((r) => r.decryptedCount).reduce((a, b) => Number(a) + Number(b));
  //   }
  // }

  get ephemeralPublicKey(): string {
    return this._ephemeralPublicKey;
  }

}
