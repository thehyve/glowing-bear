import {ChartType} from './chart-type';
import {FormatHelper} from '../../utilities/format-helper';
import {Concept} from '../constraint-models/concept';
import {ConceptType} from '../constraint-models/concept-type';

export class Chart {

  public readonly id: string;
  private _type: ChartType;
  private _variables: Concept[] = [];
  private _isValid: boolean;

  constructor(type: ChartType) {
    this.id = FormatHelper.generateId();
    this.type = type;
    this.isValid = true;
  }

  get type(): ChartType {
    return this._type;
  }

  set type(value: ChartType) {
    this._type = value;
  }

  get variables(): Concept[] {
    return this._variables;
  }

  set variables(value: Concept[]) {
    this._variables = value;
  }

  get categoricalVariables(): Concept[] {
    return this.variables.filter(variable =>
      [ConceptType.CATEGORICAL, ConceptType.DATE].indexOf(variable.type) > -1);
  }

  get numericalVariables(): Concept[] {
    return this.variables.filter(variable =>
      [ConceptType.NUMERICAL, ConceptType.HIGH_DIMENSIONAL].indexOf(variable.type) > -1);
  }

  get isValid(): boolean {
    return this._isValid;
  }

  set isValid(value: boolean) {
    this._isValid = value;
  }
}
