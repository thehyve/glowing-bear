import {Injectable} from '@angular/core';
import {AppConfig} from '../../config/app.config';
import {GenKey, AggKeys, EncryptStr, DecryptStr} from '@medco/unlynx-crypto-js-lib'
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ErrorHelper} from '../../utilities/error-helper';

@Injectable()
export class MedcoService {

  private countResults: number[] = [];
  private timesResult: object[] = [];

  private publicKey: string;
  private privateKey: string;

  private cothorityKey: string;

  /**
   * If the configuration key `medco-cothority-key-url` is present, the file will be fetched and the service enabled.
   * @param {AppConfig} config
   * @param http
   */
  constructor(private config: AppConfig, private http: HttpClient) {
    let cothorityKeyUrl = config.getConfig('medco-cothority-key-url');

    // fetch and load the cothority key
    if (cothorityKeyUrl) {
      this.http
        .get(cothorityKeyUrl, {responseType: 'text'})
        .subscribe((keyResp) => {
          this.cothorityKey = AggKeys(String(keyResp));
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

  loadUserKeyPair() {
    // todo: they are hardcoded! should be either generated at runtime, or fetched for a specific user
    // (but not implemented yet in medco cell)
    this.publicKey = 'eQviK90cvJ2lRx8ox6GgQKFmOtbgoG9RXa7UnmemtRA=';
    this.privateKey = 'iqLQz3zMlRjCyBrg4+303hsxL7F5vDtIaBxO0oc7gQA=';
    // [this.publicKey, this.privateKey] = GenKey(); // if they should be randomly generated at runtime
    console.log(`Generated the MedCo pair of keys: ${this.privateKey} -- ${this.publicKey}`);
  }

  /**
   * Encrypts an integer with the cothority key (this is not the public key generated!).
   * @param {number} integer
   * @returns {string}
   */
  encryptInteger(integer: number): string {
    return EncryptStr(this.cothorityKey, integer);
  }

  /**
   * Decrypts an integer with the private key that was set.
   * @param {string} encInteger
   * @returns {number}
   */
  decryptInteger(encInteger: string): number {
    return DecryptStr(encInteger, this.privateKey);
  }

  /**
   * Parse the MedCo results coming from PIC-SURE, themselves coming from the MedCo cells.
   * Stores the breakdown by hospital and the other information.
   *
   * @param {object} data the PIC-SURE data object
   * @returns {number} the total number of matching patients.
   */
  parseMedCoResults(data: object): number {
    // k is 0, 1, 2, ....
    for (let k in data) {
      let b64EncodedResultObject = data[k][`medco_results_${k}`];
      let resultObject = JSON.parse(atob(b64EncodedResultObject));

      if (this.publicKey !== resultObject['pub_key']) {
        console.warn(`Returned public key is different from public key, expect problems (${resultObject['pub_key']})`);
      }

      this.countResults.push(this.decryptInteger(resultObject['enc_count_result']));
      this.timesResult.push(resultObject['times']);
      console.log(`${k}: ${this.countResults[this.countResults.length - 1]}, times: ${JSON.stringify(this.timesResult[this.timesResult.length - 1])}`)
    }
    return this.countResults.reduce((a, b) => a + b);
  }
}
