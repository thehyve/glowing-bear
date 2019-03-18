/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {FractalisChartDescription} from '../../../../models/fractalis-models/fractalis-chart-description';
import {FractalisData} from '../../../../models/fractalis-models/fractalis-data';
import {Concept} from '../../../../models/constraint-models/concept';
import {FractalisChart} from '../../../../models/fractalis-models/fractalis-chart';
import {ChartType} from '../../../../models/chart-models/chart-type';
import {ConceptType} from '../../../../models/constraint-models/concept-type';
import {FractalisChartVariable} from '../../../../models/fractalis-models/fractalis-chart-variable';


export class ValidationError {
  message: string;
  constructor(message: string) {
    this.message = message;
  }
}


export class FractalisChartVariableMapper {

  static parameterKeys = [
    'groupVars',
    'durationVars',
    'observedVars',
    'numVars',
    'catVars'
  ];

  static getParameterKeys(specification: FractalisChartDescription): string[] {
    return Object.keys(specification).filter(key => this.parameterKeys.includes(key));
  }

  /**
   * Validates the parameter mapping with the specifies parameter constraints.
   *
   * @param {Map<string, string[]>} mapping
   * @param {FractalisChartDescription} specification
   * @return {ValidationError[]}
   */
  static validateMapping(mapping: Map<string, string[]>, specification: FractalisChartDescription): ValidationError[] {
    const errors: ValidationError[] = [];
    for (let key of this.getParameterKeys(specification)) {
      const label = specification[key].label;
      let variableTypeSpecification: FractalisChartVariable = specification[key];
      let declaredVariables = mapping.get(key);
      const minLength = variableTypeSpecification.minLength;
      const maxLength = variableTypeSpecification.maxLength;
      if (minLength > 0) {
        if (declaredVariables === null || declaredVariables.length < minLength) {
          errors.push(new ValidationError(`Too few parameters of type ${label} (minimum is ${minLength})`));
        }
      }
      if (maxLength < Infinity) {
        if (declaredVariables !== null && declaredVariables.length > maxLength) {
          errors.push(new ValidationError(`Too many parameters of type ${label} (maximum is ${maxLength})`));
        }
      }
    }
    if (errors.length === 0) {
      return null;
    }
    return errors;
  }

  static toExternalVariableId(task_id: string): string {
    // this is the variable representation format expected by fractal.js
    return `\${\"id\":\"${task_id}\",\"filters\":{}}\$`;
  }

  constructor(private fractalisVariables: FractalisData[]) {

  }

  private filterVariablesByType(types: ConceptType[], variables: Concept[]) {
    return variables.filter(variable => types.includes(variable.type));
  }

  private filterCategoricalVariables(variables: Concept[]): Concept[] {
    return this.filterVariablesByType([ConceptType.CATEGORICAL, ConceptType.DATE], variables);
  }

  private filterNumericalVariables(variables: Concept[]): Concept[] {
    return this.filterVariablesByType([ConceptType.NUMERICAL, ConceptType.HIGH_DIMENSIONAL], variables);
  }

  /**
   * Map the list of selected variables to the expected parameters for the chart, validates the parameter mapping
   * and converts variable names to Fractalis variable ids.
   *
   * @param {FractalisChart} chart
   * @param {Concept[]} selectedVariables
   * @return {Promise<Map<string, string[]>>}
   */
  mapVariables(chart: FractalisChart, selectedVariables: Concept[]): Promise<Map<string, string[]>> {
    return new Promise<Map<string, string[]>>((resolve, reject) => {
      const numericalVariables = this.filterNumericalVariables(selectedVariables).map(variable => variable.code);
      const categoricalVariables = this.filterCategoricalVariables(selectedVariables).map(variable => variable.code);
      const mapping = new Map<string, string[]>();
      if (chart.type === ChartType.SURVIVALPLOT) {
        mapping.set('groupVars', categoricalVariables);
        mapping.set('durationVars', numericalVariables.splice(0, 1));
        mapping.set('observedVars', numericalVariables.splice(0, 1));
      } else {
        if (chart.description.numVars) {
          mapping.set('numVars', numericalVariables);
        } else if (numericalVariables.length > 0) {
          return reject([new ValidationError('Numerical parameters not supported')])
        }
        if (chart.description.catVars) {
          mapping.set('catVars', categoricalVariables);
        } else if (categoricalVariables.length > 0) {
          return reject([new ValidationError('Categorical parameters not supported')])
        }
      }
      const errors = FractalisChartVariableMapper.validateMapping(mapping, chart.description);
      if (errors) {
        reject(errors);
      } else {
        // Map variables to internal Fractalis ids
        const result = new Map<string, string[]>();
        for (let [key, value] of Array.from(mapping)) {
          result.set(key, this.namesToFractalisVariableId(value));
        }
        const internalErrors = FractalisChartVariableMapper.validateMapping(result, chart.description);
        if (internalErrors) {
          // No valid mapping to internal ids
          resolve(null);
        } else {
          resolve(result);
        }
      }
    });
  }

  /**
   * Converts a variable name to a variable id used by Fractalis.
   *
   * @param {string[]} selectedVars
   * @return {string[]}
   */
  namesToFractalisVariableId(selectedVars: string[]): string[] {
    let fractalisVariableIds: string[] = [];
    selectedVars.forEach(varLabel => {
      let validSelectedVariableIds = this.fractalisVariables
        .filter(x => x.label === varLabel && x.task_id !== null && x.etl_state !== 'FAILURE')
        .map(v => FractalisChartVariableMapper.toExternalVariableId(v.task_id));
      fractalisVariableIds.push(...validSelectedVariableIds);
    });
    return fractalisVariableIds;
  }

}
