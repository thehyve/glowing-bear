import {Constraint} from './constraint';
import {Study} from "../study";

export class StudyConstraint implements Constraint {

  private _study:Study;

  constructor() {}

  get study():Study {
    return this._study;
  }

  set study(value:Study) {
    this._study = value;
  }

  getConstraintType(): string {
    return this.constructor.name;
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
}
