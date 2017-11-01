import {Constraint} from './constraint';
import {PedigreeState} from './pedigree-state';

export class PedigreeConstraint implements Constraint {
  private _relationType: PedigreeState;
  private _rightHandSideConstraint: Constraint;

  constructor(relationType: PedigreeState) {
    this.relationType = relationType;
  }

  getClassName(): string {
    return 'PedigreeConstraint';
  }

  toPatientQueryObject(): object {
    return {};
  }

  toQueryObject(): object {
    return {};
  }

  get textRepresentation(): string {
    let relation = '';
    switch (this.relationType) {
      case PedigreeState.Parent: {
        relation = 'Parent of ';
        break;
      }
      case PedigreeState.Child: {
        relation = 'Child of ';
        break;
      }
      case PedigreeState.Spouse: {
        relation = 'Spouse of ';
        break;
      }
      case PedigreeState.Sibling: {
        relation = 'Sibling of ';
        break;
      }
      case PedigreeState.DizygoticTwin: {
        relation = 'Dizygotic Twin to ';
        break;
      }
      case PedigreeState.MonozygoticTwin: {
        relation = 'Monozygotic Twin to ';
        break;
      }
      case PedigreeState.UnknownTwin: {
        relation = 'Twin with unknown zygosity to ';
        break;
      }
    }
    return `Pedigree: ${relation}`;
  }

  get rightHandSideConstraint(): Constraint {
    return this._rightHandSideConstraint;
  }

  set rightHandSideConstraint(value: Constraint) {
    this._rightHandSideConstraint = value;
  }

  get relationType(): PedigreeState {
    return this._relationType;
  }

  set relationType(value: PedigreeState) {
    this._relationType = value;
  }
}
