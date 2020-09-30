/// <reference lib='webworker' />
import { SurvivalState } from 'app/models/survival-analysis/survival-curves';
import { Scalar } from '@dedis/kyber'
import { CipherText, DecryptInt } from '../crypto/crypto';


import { InputDataType, OuputDataType } from './array-decrypt';


const bufferSize = 10

addEventListener('message', ({ data }) => {


  let privkey: Scalar
  privkey.unmarshalBinary((data as InputDataType).userPrivateKey)
  let initCount = CipherText.deserialize((data as InputDataType).ciphers.initialCount)
  let initialCount = DecryptInt(privkey, initCount)
  let initialCountToSend: OuputDataType

  let survivalState = new SurvivalState(initialCount);
  for (let i = 0; i < (data as InputDataType).ciphers.groupResults.length; i++) {
    let point = (data as InputDataType).ciphers.groupResults[i]
    let cipherEventsOfInterest = CipherText.deserialize(point.events.eventofinterest)
    let eventsOfInterest = DecryptInt(privkey, cipherEventsOfInterest)
    let cipherCensoringEvents = CipherText.deserialize(point.events.censoringevent)
    let censoringEvents = DecryptInt(privkey, cipherCensoringEvents)
    let survivalPoint = survivalState.next(point.timepoint, eventsOfInterest, censoringEvents)
    let res: OuputDataType
    res.clear = survivalPoint
    res.last = survivalPoint.remaining === 0 ? true : false
    postMessage(res)
    if (res.last) { return }

  }
  let finish: OuputDataType
  finish.last = true
  postMessage(finish)

});
