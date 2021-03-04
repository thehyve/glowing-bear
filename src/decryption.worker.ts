import { AngularWebWorker, bootstrapWorker, OnWorkerInit } from 'angular-web-worker';
/// <reference lib="webworker" />

@AngularWebWorker()
export class DecryptionWorker implements OnWorkerInit {

    constructor() {}

    onWorkerInit() {

    }

}
bootstrapWorker(DecryptionWorker);

/// <reference lib="webworker" />

// import {Point, Scalar} from '@dedis/kyber';
// import {CipherText, DecryptInt} from '../utilities/crypto/crypto';

// todo: support decryption of an array in here, then responsibility of calling code to maintain a pool and distribute values


// export class WorkerDecryptionRequest {
//
//   //privKey: Scalar;
//
//   // ciphers: CipherText[];
//
// }
//
// export class WorkerDecryptionResponse {
//   cleartexts: number[];
// }
//
// addEventListener('message', ({ data }) => {
//   const decryptionReq = data as WorkerDecryptionRequest;
//
//   // data.inta
//   // data.labels
//
//   // DecryptInt
//   const response = `worker response to ${data}`;
//   postMessage(response);
// });

// spawn many web workers (have a fixed number) to do the decryption, each worker has one integer to decrypt
// pass an idx + key for that

// function batchDecryption(encInts: string[], privKey: Scalar): number[] {
//   return encInts.map(encInt => {
//     let cipherText = CipherText.deserialize(encInt);
//     return DecryptInt(privKey, cipherText);
//   })
// }
