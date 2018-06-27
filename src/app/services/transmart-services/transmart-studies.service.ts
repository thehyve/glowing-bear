import {ErrorHelper} from '../../utilities/error-helper';
import {Study} from '../../models/constraint-models/study';
import {TransmartResourceService} from './transmart-resource.service';
import {AsyncSubject} from 'rxjs/AsyncSubject';
import {Observable} from 'rxjs/Observable';
import {Injectable} from '@angular/core';

@Injectable()
export class TransmartStudiesService {

  private _lock: boolean;
  private _studies: Study[] = null;
  private _studiesSubject: AsyncSubject<Study[]>;

  constructor(private transmartResourceService: TransmartResourceService) { }

  /**
   * Returns the list of all studies (and related dimensions) that
   * the user has access to.
   *
   * Fetch the studies once and caches them. Subsequent calls will
   * get the list of studies from the cache.
   *
   * @return {Promise<Study[]>}
   */
  get studies(): Promise<Study[]> {
    if (this._studies != null) {
      return Observable.of(this._studies).toPromise();
    }
    if (this._lock) {
      return this._studiesSubject.toPromise();
    }
    this._lock = true;
    this._studiesSubject = new AsyncSubject<Study[]>();

    return new Promise((resolve, reject) => {
      this.transmartResourceService.getStudies()
        .subscribe((studies: Study[]) => {
          resolve(studies);
          this._studies = studies;
          this._studiesSubject.next(this._studies);
          this._studiesSubject.complete();
          this._lock = false;
        }, (error: any) => {
          ErrorHelper.handleError(error);
          console.error(`Error retrieving studies: ${error}`);
          reject(error);
          this._studies = [];
          this._studiesSubject.next(this._studies);
          this._studiesSubject.complete();
          this._lock = false;
        });
    });
  }

}
