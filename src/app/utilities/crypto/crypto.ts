/**
 * Copyright 2020  EPFL LDS
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Point, Scalar} from '@dedis/kyber';
import {newCurve} from '@dedis/kyber/curve';
import {PointToInt} from './point-to-int-mapping';
import base64url from 'base64url';
import {ErrorHelper} from '../error-helper';

const arrayBufferToBuffer = require('arraybuffer-to-buffer');
const curve25519 = newCurve('edwards25519');

/**
 * CipherText is an ElGamal encrypted integer.
 */
export class CipherText {
  K: Point;
  C: Point;

  /**
   * Deserializes from Base64Url.
   */
  static deserialize(str: string): CipherText {
    let pointLength = curve25519.pointLen();
    let buf = base64url.toBuffer(str);

    if (buf.length !== pointLength * 2) {
      throw ErrorHelper.handleNewError(`Invalid CipherText, byte length = ${buf.length}, expected = ${pointLength}`);
    }

    let k = buf.subarray(0, pointLength);
    let c = buf.subarray(pointLength);
    return new CipherText(DeserializePoint(k), DeserializePoint(c));
  }

  constructor(K: Point, C: Point) {
    this.K = K;
    this.C = C;
  }

  toString(): string {
    return this.serialize();
  }

  /**
   * Serializes to Base64Url.
   */
  serialize(): string {
    if (!this.C || !this.K) {
      throw ErrorHelper.handleNewError('Attempting to serialize invalid CipherText');
    }

    return padBase64(base64url.encode(Buffer.concat([this.K.marshalBinary(), this.C.marshalBinary()])));
  }
}

// Encryption
// ______________________________________________________________________________________________________________________

/**
 * Encrypts an integer with the cothority key
 * @returns {CipherText}
 * @param pk
 * @param x
 */
export function EncryptInt(pk: Point, x: number): CipherText {
  return encryptPoint(pk, IntToPoint(x))
}

/**
 * Maps an integer to a point in the elliptic curve.
 * @returns {Point}
 * @param x
 */
function IntToPoint(x: number): Point {
  let B = curve25519.point().base();
  let i = curve25519.scalar().setBytes(toBytesInt32(x));
  return curve25519.point().mul(i, B)
}

/**
 * Creates an elliptic curve point from a non-encrypted point and encrypt it using ElGamal encryption.
 * @returns {CipherText}
 * @param pk
 * @param M
 */
function encryptPoint(pk: Point, M: Point): CipherText {
    let B = curve25519.point().base();
    let r = curve25519.scalar().pick(); // ephemeral private key
    // ElGamal-encrypt the point to produce ciphertext (K,C).
    let K = curve25519.point().mul(r, B);	// ephemeral DH public key
    let S = curve25519.point().mul(r, pk);	// ephemeral DH shared secret
    let C = curve25519.point().add(S, M);   // message blinded with secret
    return new CipherText(K, C)
}

// Decryption
// ______________________________________________________________________________________________________________________

/**
 * Decrypts an integer from an ElGamal cipher text where integer are encoded in the exponent.
 * @returns {number}
 * @param prikey
 * @param cipher
 */
export function DecryptInt(prikey: Scalar, cipher: CipherText): number {
  let M = decryptPoint(prikey, cipher);
  return PointToInt[M.toString()];
}

/**
 * Decrypts an elliptic point from an El-Gamal cipher text.
 * @returns {Point}
 * @param prikey
 * @param c
 */
function decryptPoint(prikey: Scalar, c: CipherText): Point {
  let S = curve25519.point().mul(prikey, c.K);	// regenerate shared secret
  return curve25519.point().sub(c.C, S)		    // use to un-blind the message
}

// Utilities
// ______________________________________________________________________________________________________________________

/**
 * Generates a random pair of keys for the user to be used during this instance.
 * @returns [private key, public key]
 */
export function GenerateKeyPair(): [Scalar, Point]  {
  let privKey = curve25519.scalar().pick();
  let pubKey = curve25519.point().mul(privKey, null);
  return [privKey, pubKey];
}

// Marshal
// ______________________________________________________________________________________________________________________

export function SerializePoint(p: Point): string {
  return padBase64(base64url.encode(p.marshalBinary()));
}

export function DeserializePoint(p: string | Buffer): Point {
  let buf: Buffer;
  if (typeof p === 'string') {
    buf = buf = base64url.toBuffer(p);
  } else {
    buf = p;
  }

  let res = curve25519.point().base();
  res.unmarshalBinary(buf);
  return res
}

export function SerializeScalar(p: Scalar): string {
  return padBase64(base64url.encode(p.marshalBinary()));
}

export function DeserializeScalar(p: string | Buffer): Scalar {
  let buf: Buffer;
  if (typeof p === 'string') {
    buf = buf = base64url.toBuffer(p);
  } else {
    buf = p;
  }

  let res = curve25519.scalar().pick();
  res.unmarshalBinary(buf);
  return res
}

/**
 * Converts a Number to Buffer of
 * @returns {Buffer}
 * @param x
 */
export function toBytesInt32 (x: number): Buffer {
  let arr = new ArrayBuffer(4); // an Int32 takes 4 bytes
  let view = new DataView(arr);
  view.setUint32(0, x, true); // byteOffset = 0; litteEndian = false
  return arrayBufferToBuffer(arr);
}

/**
 * Add Base64 padding to a Base64 value without it.
 * @param b
 */
function padBase64(b: string): string {
  if (b.length % 4 === 2) {
    b = `${b}==`;
  } else if (b.length % 4 === 3) {
    b = `${b}=`;
  }
  return b;
}
