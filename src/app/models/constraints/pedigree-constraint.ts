import {Constraint} from './constraint';
import {PedigreeState} from './pedigree-state';

export class PedigreeConstraint implements Constraint {
  private _label: string;
  private _description: string;
  private _biological: boolean;
  private _symmetrical: boolean;
  private _relationType: PedigreeState;
  private _rightHandSideConstraint: Constraint;

  constructor(label: string) {
    this.label = label;
    switch (label) {
      case 'PAR': {
        this.relationType = PedigreeState.Parent; break;
      }
      case 'SPO': {
        this.relationType = PedigreeState.Spouse; break;
      }
      case 'SIB': {
        this.relationType = PedigreeState.Sibling; break;
      }
      case 'MZ': {
        this.relationType = PedigreeState.MonozygoticTwin; break;
      }
      case 'DZ': {
        this.relationType = PedigreeState.DizygoticTwin; break;
      }
      case 'COT': {
        this.relationType = PedigreeState.UnknownTwin; break;
      }
    }
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

  get label(): string {
    return this._label;
  }

  set label(value: string) {
    this._label = value;
  }

  get description(): string {
    return this._description;
  }

  set description(value: string) {
    this._description = value;
  }

  get biological(): boolean {
    return this._biological;
  }

  set biological(value: boolean) {
    this._biological = value;
  }

  get symmetrical(): boolean {
    return this._symmetrical;
  }

  set symmetrical(value: boolean) {
    this._symmetrical = value;
  }
}
