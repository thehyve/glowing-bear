import {Constraint} from './constraint';
import {TrialVisit} from './trial-visit';

export class TrialVisitConstraint extends Constraint {

  private _trialVisits: TrialVisit[];


  constructor() {
    super();
    this.trialVisits = [];
    this.textRepresentation = 'Trial visit constraint';
  }

  get className(): string {
    return 'TrialVisitConstraint';
  }

  get trialVisits(): TrialVisit[] {
    return this._trialVisits;
  }

  set trialVisits(value: TrialVisit[]) {
    this._trialVisits = value;
  }
}
