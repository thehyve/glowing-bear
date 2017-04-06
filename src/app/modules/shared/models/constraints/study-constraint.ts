import {Constraint} from './constraint';
import {Study} from "../study";

export class StudyConstraint implements Constraint {

  constructor(private study:Study) {}

  toJsonString(): string {
    return JSON.stringify({
      type: "study_name",
      studyId: this.study.studyId
    });
  }
}
