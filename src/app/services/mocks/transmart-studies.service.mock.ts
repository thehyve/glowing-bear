import {Observable} from 'rxjs/Observable';
import {Study} from '../../models/constraint-models/study';

export class TransmartStudiesServiceMock {

  private _studies: Study[];

  constructor() {
    this._studies = [];
  }

  get studies(): Promise<Study[]> {
    return Observable.of(this._studies).toPromise();
  }

}
