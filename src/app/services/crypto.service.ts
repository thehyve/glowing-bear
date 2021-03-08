/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2018 - 2021  EPFL LCA1 / LDS
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable, OnDestroy} from '@angular/core';
import {
  EncryptInt,
  DeserializePoint,
  GenerateKeyPair,
  SerializePoint, SerializeScalar
} from '../utilities/crypto/crypto';
import {Point, Scalar} from '@dedis/kyber';
import {MedcoNetworkService} from './api/medco-network.service';
import {WorkerClient, WorkerManager} from 'angular-web-worker/angular';
import {DecryptionWorker} from '../../decryption.worker';
import {fromPromise} from 'rxjs/internal-compatibility';
import {Observable} from 'rxjs';
import {ErrorHelper} from '../utilities/error-helper';

@Injectable()
export class CryptoService implements OnDestroy {

  private static nbParallelWorkers = 8;
  private decryptionClients: WorkerClient<DecryptionWorker>[];

  private _ephemeralPublicKey: Point;
  private _ephemeralPrivateKey: Scalar;

  /**
   * This constructor loads an ephemeral pair of keys for this instance of Glowing-Bear.
   */
  constructor(private medcoNetworkService: MedcoNetworkService, private workerManager: WorkerManager) {

    // create clients workers
    this.decryptionClients = [];
    if (this.workerManager.isBrowserCompatible) {
      for (let i = 0 ; i < CryptoService.nbParallelWorkers ; i++) {
        this.decryptionClients.push(this.workerManager.createClient(DecryptionWorker));
      }
      console.log('[CRYPTO] Web worker support is enabled.')
    } else {
      // fallback if web workers are not supported
      for (let i = 0 ; i < CryptoService.nbParallelWorkers ; i++) {
        this.decryptionClients.push(this.workerManager.createClient(DecryptionWorker, true));
      }
      console.warn('[CRYPTO] Web workers are not supported in this environment, decryption will slow down the UI.')
    }
  }

  load(): Promise<void> {
    this.loadEphemeralKeyPair();
    return Promise.all(this.decryptionClients.map(client => client.connect()))
      .then(() => Promise.all([
        this.decryptionClients.forEach(client => client.set(w => w.collectiveKeyPublic, this.medcoNetworkService.networkPubKey)),
        this.decryptionClients.forEach(client => client.set(w => w.keyPairPublic, SerializePoint(this._ephemeralPublicKey))),
        this.decryptionClients.forEach(client => client.set(w => w.keyPairPrivate, SerializeScalar(this._ephemeralPrivateKey)))
      ]))
      .then(() => console.log(`[CRYPTO] Initialised ${CryptoService.nbParallelWorkers} decryption workers.`));
  }

  ngOnDestroy() {
    this.decryptionClients.forEach(client => client.destroy());
  }

  /**
   * Generates a random pair of keys for the user to be used during this instance.
   */
  private loadEphemeralKeyPair(): void {
    [this._ephemeralPrivateKey, this._ephemeralPublicKey] = GenerateKeyPair();
    console.log(`[CRYPTO] Generated the ephemeral pair of keys (public: ${this.ephemeralPublicKey}).`);
  }

  /**
   * Encrypts an integer with the cothority key (this is not the public key generated!).
   * @param {number} integer to encrypt
   * @returns {string} the integer encrypted with cothority key
   */
  encryptIntegerWithCothorityKey(integer: number): string {
    let cothorityKey = DeserializePoint(this.medcoNetworkService.networkPubKey);
    return EncryptInt(cothorityKey, integer).toString();
  }

  /**
   * Decrypts integers with the ephemeral private key that was generated.
   * @returns {number} the integer decrypted with ephemeral key
   * @param encIntegers
   */
  decryptIntegersWithEphemeralKey(encIntegers: string[]): Observable<number[]> {
    const start = performance.now()
    const valsPerWorkers = Math.ceil(encIntegers.length / CryptoService.nbParallelWorkers);

    return fromPromise(
      Promise.all(this.decryptionClients.map((client, clientIdx) =>
        client.call(worker =>
          worker.decryptWithKeyPair(encIntegers.slice(clientIdx * valsPerWorkers, (clientIdx + 1) * valsPerWorkers))
        )
      )).then(doubleArray => {
        console.log(`[CRYPTO] Decrypted ${encIntegers.length} values with ${CryptoService.nbParallelWorkers} workers in ${performance.now() - start}ms.`);
        return doubleArray.reduce((prevArray, currArray) => prevArray.concat(currArray), [])
      }).catch(err => {
        ErrorHelper.handleError('Error during decryption', err);
        throw err;
      })
    );
  }

  get ephemeralPublicKey(): string {
    return SerializePoint(this._ephemeralPublicKey);
  }
}
