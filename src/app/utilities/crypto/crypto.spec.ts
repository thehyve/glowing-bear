/**
 * Copyright 2020  EPFL LDS
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  DeserializePoint,
  DeserializeScalar,
  SerializePoint,
  SerializeScalar,
  IntToPoint,
  GenerateKeyPair, EncryptInt, DecryptInt
} from './crypto';
import {PointToInt} from './point-to-int-mapping';

describe('Crypto Test', () => {
  let [secKey, pubKey] = GenerateKeyPair();
  let testInts = [0, 5, 100, 727, 9999];

  it('should serialize and deserialize keys', () => {
    let seckeySer = SerializeScalar(secKey);
    expect(DeserializeScalar(seckeySer).equals(secKey)).toBeTrue();
    let pubKeySer = SerializePoint(pubKey);
    expect(DeserializePoint(pubKeySer).equals(pubKey)).toBeTrue();
  })

  it('should convert ints from and to points', () => {
    for (let int of testInts) {
      let p = IntToPoint(int);
      expect(PointToInt[p.toString()]).toBe(int);
    }
  })

  it('should encrypt and decrypt', () => {
    for (let int of testInts) {
      let e = EncryptInt(pubKey, int);
      let d = DecryptInt(secKey, e);
      expect(d).toBe(int);
    }
  })
});
