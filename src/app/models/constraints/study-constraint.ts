import {Constraint} from './constraint';
import {Study} from '../study';

export class StudyConstraint implements Constraint {

  private _parent: Constraint;
  private _studies: Study[];
  private _isSubselection: boolean;

  constructor() {
    this._studies = [];
    this.parent = null;
  }

  get studies(): Study[] {
    return this._studies;
  }

  set studies(value: Study[]) {
    this._studies = value;
  }

  getClassName(): string {
    return 'StudyConstraint';
  }

  toQueryObjectWithSubselection(): Object {
    // TODO: implement the 'subselection' wrapper on a normal query object
    return null;
  }

  toQueryObjectWithoutSubselection(): object {
    if (this._studies.length === 0) {
      return null;
    }

    // Construct query objects for all studies
    let childQueryObjects: Object[] = [];
    for (let study of this.studies) {
      childQueryObjects.push({
        'type': 'study_name',
        'studyId': study.studyId
      });
    }

    if (childQueryObjects.length === 1) {
      // Don't wrap in 'or' if we only have one study
      return childQueryObjects[0];
    } else {
      // Wrap study query objects in 'or' constraint
      return {
        'type': 'or',
        'args': childQueryObjects
      };
    }
  }

  toQueryObject(): Object {
    if (this.isSubselection) {
      return this.toQueryObjectWithSubselection();
    } else {
      return this.toQueryObjectWithoutSubselection();
    }
  }

  get textRepresentation(): string {
    let result: string = (this.studies) ? 'Study: ' : 'Study';
    for (let study of this.studies) {
      result += study.studyId + ', ';
    }
    result = (this.studies) ? result.substring(0, result.length - 2) : result;
    return result;
  }

  get isSubselection(): boolean {
    return this._isSubselection;
  }

  set isSubselection(value: boolean) {
    this._isSubselection = value;
  }

  get parent(): Constraint {
    return this._parent;
  }

  set parent(value: Constraint) {
    this._parent = value;
  }
}
