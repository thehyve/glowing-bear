/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {FractalisChartVariableMapper} from './fractalis-chart-variable-mapper';
import {ChartType} from '../../../../models/chart-models/chart-type';
import {Concept} from '../../../../models/constraint-models/concept';
import {ConceptType} from '../../../../models/constraint-models/concept-type';
import {FractalisData} from '../../../../models/fractalis-models/fractalis-data';
import {FractalisChart} from '../../../../models/fractalis-models/fractalis-chart';
import {FractalisEtlState} from '../../../../models/fractalis-models/fractalis-etl-state';
import {FractalisDataType} from '../../../../models/fractalis-models/fractalis-data-type';


describe('FractalisChartVariableMapper', () => {

  const mockFakeChart: FractalisChart = {
    type: ChartType.BOXPLOT,
    chartObject: {},
    description: {
      numVars: {
        label: 'Numerical',
        minLength: 1,
        maxLength: 1,
        value: []
      }
    }
  };

  const mockBoxplotChart: FractalisChart = {
    type: ChartType.BOXPLOT,
    chartObject: {},
    description: {
      numVars: {
        label: 'Numerical',
        minLength: 1,
        maxLength: Infinity,
        value: []
      },
      catVars: {
        label: 'Categorical',
        minLength: 0,
        maxLength: Infinity,
        value: []
      }
    }
  };

  const mockSurvivalChart: FractalisChart = {
    type: ChartType.SURVIVALPLOT,
    chartObject: {},
    description: {
      groupVars: {
        label: 'Group variables [categorical]',
        minLength: 0,
        maxLength: Infinity,
        value: []
      },
      durationVars: {
        label: 'Duration [numerical]',
        minLength: 1,
        maxLength: 1,
        value: []
      },
      observedVars: {
        label: 'Observed [numerical]',
        minLength: 0,
        maxLength: 1,
        value: []
      }
    }
  };

  const mockVolcanoChart: FractalisChart = {
    type: ChartType.BOXPLOT,
    chartObject: {},
    description: {
      numVars: {
        label: 'Numerical',
        minLength: 1,
        maxLength: Infinity,
        value: []
      }
    }
  };

  const mockFractalisTaskData: FractalisData[] = [
    {
      data_type: FractalisDataType.NUMERICAL,
      etl_message: '',
      etl_state: FractalisEtlState.SUCCESS,
      label: 'concept_num_1',
      task_id: 'var_1'
    },
    {
      data_type: FractalisDataType.NUMERICAL,
      etl_message: '',
      etl_state: FractalisEtlState.SUCCESS,
      label: 'concept_num_2',
      task_id: 'var_2'
    },
    {
      data_type: FractalisDataType.CATEGORICAL,
      etl_message: '',
      etl_state: FractalisEtlState.SUCCESS,
      label: 'concept_cat_1',
      task_id: 'var_3'
    }
  ];

  let variableMapper: FractalisChartVariableMapper;

  function createMockConcept(code: string, type: ConceptType): Concept {
    const concept = new Concept();
    concept.type = type;
    concept.code = code;
    return concept;
  }

  beforeEach(() => {
    variableMapper = new FractalisChartVariableMapper(mockFractalisTaskData);
  });

  it('correctly validates and maps variables for a box plot', (done) => {
    const variables: Concept[] = [
      createMockConcept('concept_num_1', ConceptType.NUMERICAL),
    ];
    variableMapper.mapVariables(mockBoxplotChart, variables)
      .then(mapping => {
        expect(mapping).not.toBeNull();
        expect(mapping.get('numVars')).not.toBeNull();
        expect(mapping.get('numVars')).toEqual([
          FractalisChartVariableMapper.toExternalVariableId('var_1')
        ]);
        done();
      })
      .catch(errors => {
        fail(errors);
        done();
      });
  });

  it('returns an empty mapping when no Fractalis tasks are available yet', (done) => {
    const variables: Concept[] = [
      createMockConcept('concept_num_unavailable', ConceptType.NUMERICAL),
    ];
    variableMapper.mapVariables(mockBoxplotChart, variables)
      .then(mapping => {
        // empty mapping is returned, when the number of parameters is valid, but the variables
        // cannot be mapped to Fractalis task ids, yet.
        expect(mapping).toBeNull();
        done();
      })
      .catch(errors => {
        fail(errors);
        done();
      });
  });

  it('correctly fails validation for a plot with too many variables selected', (done) => {
    const variables: Concept[] = [
      createMockConcept('concept_num_1', ConceptType.NUMERICAL),
      createMockConcept('concept_num_2', ConceptType.NUMERICAL)
    ];
    variableMapper.mapVariables(mockFakeChart, variables)
      .then(() => {
        fail('Expected validation error');
        done();
      })
      .catch(errors => {
        expect(errors.length).toEqual(1);
        const messages = errors.map(error => error.message);
        expect(messages).toContain('Too many parameters of type Numerical (maximum is 1)');
        done();
      });
  });

  it('correctly validates and maps variables for a survival plot', (done) => {
    const variables: Concept[] = [
      createMockConcept('concept_num_1', ConceptType.NUMERICAL),
      createMockConcept('concept_num_2', ConceptType.NUMERICAL),
      createMockConcept('concept_cat_1', ConceptType.CATEGORICAL),
    ];
    variableMapper.mapVariables(mockSurvivalChart, variables)
      .then(mapping => {
        expect(mapping).not.toBeNull();
        expect(mapping.get('groupVars')).not.toBeNull();
        expect(mapping.get('groupVars')).toEqual([
          FractalisChartVariableMapper.toExternalVariableId('var_3')
        ]);
        expect(mapping.get('durationVars')).not.toBeNull();
        expect(mapping.get('durationVars')).toEqual([
          FractalisChartVariableMapper.toExternalVariableId('var_1')
        ]);
        expect(mapping.get('observedVars')).not.toBeNull();
        expect(mapping.get('observedVars')).toEqual([
          FractalisChartVariableMapper.toExternalVariableId('var_2')
        ]);
        done();
      })
      .catch(errors => {
        fail(errors);
        done();
      });
  });

  it('correctly fails validation for a survival plot', (done) => {
    const variables: Concept[] = [];
    variableMapper.mapVariables(mockSurvivalChart, variables)
      .then(() => {
        fail('Expected validation error');
        done();
      })
      .catch(errors => {
        expect(errors.length).toEqual(1);
        const messages = errors.map(error => error.message);
        expect(messages).toContain('Too few parameters of type Duration [numerical] (minimum is 1)');
        done();
      });
  });

  it('correctly fails validation for a volcano plot with categorical parameters', (done) => {
    const variables: Concept[] = [
      createMockConcept('concept_cat_1', ConceptType.CATEGORICAL)
    ];
    variableMapper.mapVariables(mockVolcanoChart, variables)
      .then(() => {
        fail('Expected validation error');
        done();
      })
      .catch(errors => {
        expect(errors.length).toEqual(1);
        const messages = errors.map(error => error.message);
        expect(messages).toContain('Categorical parameters not supported');
        done();
      });
  });

  it('correctly fails validation for a volcano plot with no parameters', (done) => {
    const variables: Concept[] = [];
    variableMapper.mapVariables(mockVolcanoChart, variables)
      .then(() => {
        fail('Expected validation error');
        done();
      })
      .catch(errors => {
        expect(errors.length).toEqual(1);
        const messages = errors.map(error => error.message);
        expect(messages).toContain('Too few parameters of type Numerical (minimum is 1)');
        done();
      });
  });

  it('correctly validates a volcano plot', (done) => {
    const variables: Concept[] = [
      createMockConcept('concept_num_1', ConceptType.NUMERICAL),
      createMockConcept('concept_num_2', ConceptType.NUMERICAL),
    ];
    variableMapper.mapVariables(mockVolcanoChart, variables)
      .then(mapping => {
        expect(mapping).not.toBeNull();
        expect(mapping.get('numVars')).not.toBeNull();
        expect(mapping.get('numVars')).toEqual([
          FractalisChartVariableMapper.toExternalVariableId('var_1'),
          FractalisChartVariableMapper.toExternalVariableId('var_2')
        ]);
        done();
      })
      .catch(errors => {
        fail(errors);
        done();
      });
  });

});
