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
    let result: string = (this.studies) ? 'Study: ' : 'Study';
    result += this.studies.map(study => study.studyId).join(', ');
    this._textRepresentation = result;
    return this._textRepresentation;
  }

  set textRepresentation(value: string) {
    this._textRepresentation = value;
  }
}
