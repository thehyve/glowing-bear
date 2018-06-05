import {Constraint} from './constraint';
import {Study} from './study';

export class StudyConstraint extends Constraint {

  private _studies: Study[];

  constructor() {
    super();
    this._studies = [];
  }

  get studies(): Study[] {
    return this._studies;
  }

  set studies(value: Study[]) {
    this._studies = value;
  }

  get className(): string {
    return 'StudyConstraint';
  }

  get textRepresentation(): string {
    /*
     * TODO: avoid checking studies during runtime
     */
    let result: string = (this.studies) ? 'Study: ' : 'Study';
    for (let study of this.studies) {
      result += study.studyId + ', ';
    }
    this._textRepresentation = (this.studies) ? result.substring(0, result.length - 2) : result;
    return this.textRepresentation;
  }

  set textRepresentation(value: string) {
    this._textRepresentation = value;
  }
}
