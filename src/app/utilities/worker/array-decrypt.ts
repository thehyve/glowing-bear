
import { Scalar } from '@dedis/kyber'
import { SurvivalPoint } from 'app/models/survival-analysis/survival-curves'
import { CryptoService } from 'app/services/crypto.service'
import { Subject } from 'rxjs'

export interface Points {
  initialCount: string
  groupResults: {
    timepoint: number
    events: {
      eventofinterest: string
      censoringevent: string

    }
  }[]
}

export interface InputDataType {
  userPrivateKey: Buffer
  ciphers: Points
}
export interface OuputDataType {

  clear?: SurvivalPoint

  message?: string
  last: boolean
}

export class ArrayDecrypt {
  _marshalledKey: Buffer
  _threadNofitier: Subject<OuputDataType>
  constructor(privKey: Scalar, private points: Points) {
    this._marshalledKey = privKey.marshalBinary()
    this._threadNofitier = new Subject()
  }
  run() {
    let worker = new Worker('./array-decrypt.worker.ts', { type: 'module' })
    worker.onmessage = ({ data }) => {
      if (data.value) {
        this._threadNofitier.next(data.value)
      }
    }

    worker.postMessage(this.points)
  }
}
