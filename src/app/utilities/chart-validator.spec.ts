/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {ChartValidator} from './chart-validator';
import {FractalisChartVariable} from '../models/fractalis-models/fractalis-chart-variable';
import {Chart} from '../models/chart-models/chart';
import {ChartType} from '../models/chart-models/chart-type';
import {Concept} from '../models/constraint-models/concept';
import {ConceptType} from '../models/constraint-models/concept-type';

describe('ChartValidator', () => {

  let chartValidator: ChartValidator;

  beforeEach(() => {
    this.chartValidator = new ChartValidator();
  });

  it('correctly updates validation criteria', () => {
    let catVars: FractalisChartVariable = {minLength: 3, maxLength: 10, value: []};
    let numVars: FractalisChartVariable = {maxLength: Infinity, value: []};
    this.chartValidator.updateValidationCriteria(catVars, numVars);

    expect(this.chartValidator['minCatVarLength']).toBe(3);
    expect(this.chartValidator['maxCatVarLength']).toBe(10);
    expect(this.chartValidator['minNumVarLength']).toBe(0);
    expect(this.chartValidator['maxNumVarLength']).toBe(Infinity);
  });

  it('correctly validates a number of variables', () => {
    let catVars: FractalisChartVariable = {maxLength: 2, value: []};
    let numVars: FractalisChartVariable = {minLength: 1, maxLength: 1, value: []};
    this.chartValidator.updateValidationCriteria(catVars, numVars);

    // when no numerical
    let sampleChart = new Chart(ChartType.BOXPLOT);
    let catConcept = new Concept();
    catConcept.type = ConceptType.CATEGORICAL;
    sampleChart.variables.push(catConcept);
    sampleChart.variables.push(catConcept);

    // then chart not valid
    expect(this.chartValidator.isNumberOfVariablesValid(sampleChart)).toBe(false);

    // when is 1 numerical and 3 categorical
    let numConcept = new Concept();
    numConcept.type = ConceptType.NUMERICAL;
    sampleChart.variables.push(numConcept);

    // then chart is valid
    expect(this.chartValidator.isNumberOfVariablesValid(sampleChart)).toBe(true);

    // when is 1 numerical, but 3 categorical
    sampleChart.variables.push(catConcept);

    // then chart is not valid
    expect(this.chartValidator.isNumberOfVariablesValid(sampleChart)).toBe(false);
  });

});

