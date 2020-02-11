/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2018 - 2020  EPFL LCA1 / LDS
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {
  CipherText,
  DecryptInt,
  EncryptInt,
  DeserializePoint,
  GenerateKeyPair,
  SerializePoint
} from "../utilities/crypto/crypto";
import {Point, Scalar} from "@dedis/kyber";
import {MedcoNetworkService} from "./api/medco-network.service";

@Injectable()
export class CryptoService {

  private _ephemeralPublicKey: Point;
  private _ephemeralPrivateKey: Scalar;

  /**
   * This constructor loads an ephemeral pair of keys for this instance of Glowing-Bear.
   */
  constructor(private medcoNetworkService: MedcoNetworkService) {
    this.loadEphemeralKeyPair();
  }

  /**
   * Generates a random pair of keys for the user to be used during this instance.
   */
  private loadEphemeralKeyPair(): void {
    [this._ephemeralPrivateKey, this._ephemeralPublicKey] = GenerateKeyPair();
    console.log(`Generated the ephemeral pair of keys (public: ${this.ephemeralPublicKey})`);
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
   * Decrypts an integer with the ephemeral private key that was generated.
   * @param {string} encInteger to decrypt
   * @returns {number} the integer decrypted with ephemeral key
   */
  decryptIntegerWithEphemeralKey(encInteger: string): number {
    let cipherText = CipherText.deserialize(encInteger);
    return DecryptInt(this._ephemeralPrivateKey, cipherText);
  }

  get ephemeralPublicKey(): string {
    return SerializePoint(this._ephemeralPublicKey);
  }
}
