import {Constraint} from './constraint';
import {PedigreeState} from './pedigree-state';
import {CombinationConstraint} from './combination-constraint';

export class PedigreeConstraint implements Constraint {
  private _parent: Constraint;
  private _label: string;
  private _description: string;
  private _biological: boolean;
  private _symmetrical: boolean;
  private _relationType: PedigreeState;
  private _rightHandSideConstraint: CombinationConstraint;
  private _isPatientSelection: boolean;

  constructor(label: string) {
    this.parent = null;
    this.label = label;
    switch (label) {
      case 'PAR': {
        this.relationType = PedigreeState.Parent;
        break;
      }
      case 'CHI': {
        this.relationType = PedigreeState.Child;
        break;
      }
      case 'SPO': {
        this.relationType = PedigreeState.Spouse;
        break;
      }
      case 'SIB': {
        this.relationType = PedigreeState.Sibling;
        break;
      }
      case 'MZ': {
        this.relationType = PedigreeState.MonozygoticTwin;
        break;
      }
      case 'DZ': {
        this.relationType = PedigreeState.DizygoticTwin;
        break;
      }
      case 'COT': {
        this.relationType = PedigreeState.UnknownTwin;
        break;
      }
    }
    this.rightHandSideConstraint = new CombinationConstraint();
    this.rightHandSideConstraint.parent = this;
  }

  getClassName(): string {
    return 'PedigreeConstraint';
  }

  /**
   * TODO
   * @returns {Object}
   */
  toPatientQueryObject(): object {
    return {};
  }

  /**
   * TODO: implement shareHousehold flag
   * @returns {Object}
   */
  toQueryObject(): object {
    if (this.isPatientSelection) {
      return this.toPatientQueryObject();
    } else {
      return {
        type: 'relation',
        relatedSubjectsConstraint: this.rightHandSideConstraint.toQueryObject(),
        relationTypeLabel: this.label,
        biological: this.biological
      };
    }
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

  get rightHandSideConstraint(): CombinationConstraint {
    return this._rightHandSideConstraint;
  }

  set rightHandSideConstraint(value: CombinationConstraint) {
    this._rightHandSideConstraint = value;
    this._rightHandSideConstraint.parent = this;
  }

  get relationType(): PedigreeState {
    return this._relationType;
  }

  set relationType(value: PedigreeState) {
    this._relationType = value;
    switch (value) {
      case PedigreeState.Parent: {
        this.label = 'PAR';
        break;
      }
      case PedigreeState.Child: {
        this.label = 'CHI';
        break;
      }
      case PedigreeState.Spouse: {
        this.label = 'SPO';
        break;
      }
      case PedigreeState.Sibling: {
        this.label = 'SIB';
        break;
      }
      case PedigreeState.DizygoticTwin: {
        this.label = 'DZ';
        break;
      }
      case PedigreeState.MonozygoticTwin: {
        this.label = 'MZ';
        break;
      }
      case PedigreeState.UnknownTwin: {
        this.label = 'COT';
        break;
      }
    }
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

  get isPatientSelection(): boolean {
    return this._isPatientSelection;
  }

  set isPatientSelection(value: boolean) {
    this._isPatientSelection = value;
  }

  get parent(): Constraint {
    return this._parent;
  }

  set parent(value: Constraint) {
    this._parent = value;
    if (this.rightHandSideConstraint &&
      this.rightHandSideConstraint.parent !== this) {
      this.rightHandSideConstraint.parent = this;
    }
  }
}
