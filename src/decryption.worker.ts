import {Accessable, AngularWebWorker, bootstrapWorker, Callable, OnWorkerInit} from 'angular-web-worker';
import {
  CipherText,
  DecryptInt,
  DeserializePoint, DeserializeScalar,
  EncryptInt
} from './app/utilities/crypto/crypto';
import {Point, Scalar} from '@dedis/kyber';
/// <reference lib="webworker" />

@AngularWebWorker()
export class DecryptionWorker implements OnWorkerInit {

  // the keys are set as parameters because all data in/out the worker is serialized, this avoids slowing down the operation
  // they must be basic types, because of the serialization the object's function are not transferred

  @Accessable() collectiveKeyPublic: string;
  @Accessable() keyPairPublic: string;
  @Accessable() keyPairPrivate: string;

  private _collectiveKeyPublic: Point;
  private _keyPairPublic: Point;
  private _keyPairPrivate: Scalar;

  constructor() {}

  onWorkerInit() {}

  private deserializeKeys(): void {
    if (!this._collectiveKeyPublic) {
      this._collectiveKeyPublic = DeserializePoint(this.collectiveKeyPublic);
    }
    if (!this._keyPairPublic) {
      this._keyPairPublic = DeserializePoint(this.keyPairPublic);
    }
    if (!this._keyPairPrivate) {
      this._keyPairPrivate = DeserializeScalar(this.keyPairPrivate);
    }
  }

  @Callable()
  decryptWithKeyPair(encInts: string[]): number[] {
    this.deserializeKeys();
    return encInts.map(encInt => {
      let cipherText = CipherText.deserialize(encInt);
      return DecryptInt(this._keyPairPrivate, cipherText);
    })
  }

  @Callable()
  encryptWithKeyPair(ints: number[]): string[] {
    this.deserializeKeys();
    return ints.map(int => EncryptInt(this._collectiveKeyPublic, int).toString());
  }

}
bootstrapWorker(DecryptionWorker);
