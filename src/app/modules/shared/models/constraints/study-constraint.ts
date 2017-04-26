import {Constraint} from './constraint';
import {Study} from "../study";

export class StudyConstraint implements Constraint {

  private _type: string;
  private _study:Study;

  constructor() {
    this._type = 'StudyConstraint';
  }

  get study():Study {
    return this._study;
  }

  set study(value:Study) {
    this._study = value;
  }

  getConstraintType(): string {
    return this._type;
  }

  toQueryObject(): Object {
    if (!this._study) {
      return null;
    }
    return {
      type: "study_name",
      studyId: this.study.studyId
    };
  }

  get textRepresentation(): string {
    if (this.study) {
      return `Study: ${this.study.studyId}`
    }
    return 'Study';
  }
}
