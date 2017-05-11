import {Constraint} from './constraint';
import {Study} from "../study";
import {CombinationConstraint} from "./combination-constraint";
import {CombinationState} from "./combination-state";

export class StudyConstraint implements Constraint {

  private _type: string;
  private _studies: Study[];

  constructor() {
    this._type = 'StudyConstraint';
    this._studies = [];
  }

  get studies(): Study[] {
    return this._studies;
  }

  set studies(value: Study[]) {
    this._studies = value;
  }

  getConstraintType(): string {
    return this._type;
  }

  toQueryObject(): Object {
    if (!this._studies) {
      return null;
    }

    let query = {
      "type": "or",
      "args": []
    };
    for(let study of this.studies) {
      query.args.push({
        "type": "study_name",
        "studyId": study.studyId
      })
    }
    return query;
  }

  get textRepresentation(): string {
    let result: string = (this.studies) ? 'Study: ' : 'Study';
    for (let study of this.studies) {
      result += study.studyId + ', '
    }
    result = (this.studies) ? result.substring(0, result.length - 2) : result;
    return result;
  }
}
