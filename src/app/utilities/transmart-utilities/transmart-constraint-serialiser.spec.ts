import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {Concept} from '../../models/constraint-models/concept';
import {ConceptType} from '../../models/constraint-models/concept-type';
import {ValueConstraint} from '../../models/constraint-models/value-constraint';
import {
  TransmartAndConstraint,
  TransmartConceptConstraint,
  TransmartConstraint,
  TransmartNegationConstraint,
  TransmartOrConstraint,
  TransmartPatientSetConstraint,
  TransmartRelationConstraint,
  TransmartSubSelectionConstraint,
  TransmartTrueConstraint,
  TransmartValueConstraint
} from '../../models/transmart-models/transmart-constraint';
import {CombinationState} from '../../models/constraint-models/combination-state';
import {TransmartConstraintSerialiser} from './transmart-constraint-serialiser';
import {ValueType} from '../../models/constraint-models/value-type';
import {Operator} from '../../models/constraint-models/operator';
import {Constraint} from '../../models/constraint-models/constraint';
import {PedigreeConstraint} from '../../models/constraint-models/pedigree-constraint';
import {SubjectSetConstraint} from '../../models/constraint-models/subject-set-constraint';
import deepEqual = require('deep-equal');
import {TrueConstraint} from '../../models/constraint-models/true-constraint';

describe('TransmartConstraintSerialiser', () => {

  const serialiser = new TransmartConstraintSerialiser(false);

  function testConstraint(constraint: Constraint, expected: TransmartConstraint) {
    const serialisedConstraint = JSON.parse(JSON.stringify(serialiser.visit(constraint)));
    const expectedConstraint = JSON.parse(JSON.stringify(expected));
    if (!deepEqual(serialisedConstraint, expectedConstraint)) {
      console.error('Serialised', JSON.stringify(serialisedConstraint, null, 2));
      console.error('Expected', JSON.stringify(expectedConstraint, null, 2));
    }
    expect(serialisedConstraint).toEqual(expectedConstraint);
  }

  const ageValueConstraint =  new ValueConstraint();
  ageValueConstraint.operator = Operator.geq;
  ageValueConstraint.valueType = ValueType.numeric;
  ageValueConstraint.value = 50;

  function createConceptConstraint(type: ConceptType, conceptCode: string): ConceptConstraint {
    const constraint = new ConceptConstraint();
    const concept = new Concept();
    concept.code = conceptCode;
    concept.type = type;
    constraint.concept = concept;
    return constraint;
  }

  function createStringValueConstraint(value: string): ValueConstraint {
    const valueConstraint = new ValueConstraint();
    valueConstraint.operator = Operator.eq;
    valueConstraint.valueType = ValueType.string;
    valueConstraint.value = value;
    return valueConstraint;
  }

  /**
   * When using subject dimension constraints, e.g., patients
   * are linked to samples, empty subconstraints are relevant.
   * I.e., there is a difference between all patients with a sample
   * and all patients. Subject dimension constraints without
   * children should not be optimised away.
   */
  it('should serialise samples query without children', () => {
    // Subject set
    const biomaterialCombination = new CombinationConstraint(
      [], CombinationState.And, 'biomaterial');
    const patientCombination = new CombinationConstraint(
      [biomaterialCombination], CombinationState.And, 'patient');
    const expected: TransmartSubSelectionConstraint = {
      type: 'subselection',
      dimension: 'patient',
      constraint: {
        type: 'subselection',
        dimension: 'biomaterial',
        constraint: {
          type: 'true'
        } as TransmartTrueConstraint
      } as TransmartSubSelectionConstraint
    };
    testConstraint(patientCombination, expected);
  });

  it('should serialise "select all biomaterials for patients with age >= 50"', () => {
    const ageConstraint = createConceptConstraint(ConceptType.NUMERICAL, 'CODE:AGE');
    ageConstraint.valueConstraints.push(ageValueConstraint.clone());
    const patientAgeConstraint = new CombinationConstraint(
      [ageConstraint], CombinationState.And, 'patient');
    const biomaterialConstraint = new CombinationConstraint(
        [patientAgeConstraint], CombinationState.And, 'biomaterial');
    const expected: TransmartSubSelectionConstraint = {
      type: 'subselection',
      dimension: 'biomaterial',
      constraint: {
        type: 'subselection',
        dimension: 'patient',
        constraint: {
          type: 'and',
          args: [{
            type: 'concept',
            conceptCode: 'CODE:AGE',
          }, {
            type: 'value',
            valueType: 'numeric',
            operator: '>=',
            value: 50
          }]
        }
      } as TransmartSubSelectionConstraint
    };
    testConstraint(biomaterialConstraint, expected);
  });

  it('should serialise "select all biomaterials of type A for patients with age >= 50"', () => {
    const ageConstraint = createConceptConstraint(ConceptType.NUMERICAL, 'CODE:AGE');
    ageConstraint.valueConstraints.push(ageValueConstraint.clone());
    const patientAgeConstraint = new CombinationConstraint(
      [ageConstraint], CombinationState.And, 'patient');
    const typeConstraint = new ConceptConstraint();
    const typeConcept = new Concept();
    typeConcept.code = 'BIO:TYPE';
    typeConcept.type = ConceptType.CATEGORICAL;
    typeConstraint.concept = typeConcept;
    const typeValueConstraint = createStringValueConstraint('A');
    typeConstraint.valueConstraints.push(typeValueConstraint);
    const biomaterialConstraint = new CombinationConstraint(
      [typeConstraint, patientAgeConstraint], CombinationState.And, 'biomaterial');
    const constraint = new CombinationConstraint(
      [biomaterialConstraint], CombinationState.And, 'biomaterial'
    );
    const expected: TransmartSubSelectionConstraint = {
      type: 'subselection',
      dimension: 'biomaterial',
      constraint: {
        type: 'and',
        args: [
          {
            type: 'subselection',
            dimension: 'biomaterial',
            constraint: {
              type: 'and',
              args: [
                {
                  type: 'concept',
                  conceptCode: 'BIO:TYPE'
                },
                {
                  type: 'value',
                  valueType: 'string',
                  operator: '=',
                  value: 'A'
                }
              ]
            }
          },
          {
            type: 'subselection',
            dimension: 'patient',
            constraint: {
              type: 'and',
              args: [
                {
                  type: 'concept',
                  conceptCode: 'CODE:AGE',
                },
                {
                  type: 'value',
                  valueType: 'numeric',
                  operator: '>=',
                  value: 50
                }
              ]
            }
          } as TransmartSubSelectionConstraint
        ]
      } as TransmartAndConstraint
    };
    testConstraint(constraint, expected);
  });

  it('should serialise "select all patients with biomaterials of type A"', () => {
    const typeConstraint = createConceptConstraint(ConceptType.CATEGORICAL, 'BIO:TYPE');
    const typeValueConstraint = createStringValueConstraint('A');
    typeConstraint.valueConstraints.push(typeValueConstraint);
    const biomaterialConstraint = new CombinationConstraint(
      [typeConstraint], CombinationState.And, 'biomaterial');
    const expected: TransmartSubSelectionConstraint = {
      type: 'subselection',
      dimension: 'biomaterial',
      constraint: {
        type: 'and',
        args: [
          {
            type: 'concept',
            conceptCode: 'BIO:TYPE',
          },
          {
            type: 'value',
            valueType: ValueType.string,
            operator: '=',
            value: 'A'
          } as TransmartValueConstraint
        ]
      } as TransmartAndConstraint
    };
    testConstraint(biomaterialConstraint, expected);
  });

  it('should serialise "select all parents of patients with biomaterials of type A"', () => {
    const typeConstraint = createConceptConstraint(ConceptType.CATEGORICAL, 'BIO:TYPE');
    const typeValueConstraint = createStringValueConstraint('A');
    typeConstraint.valueConstraints.push(typeValueConstraint);
    const biomaterialConstraint = new CombinationConstraint(
      [typeConstraint], CombinationState.And, 'biomaterial');
    const parentConstraint = new PedigreeConstraint('parent');
    parentConstraint.rightHandSideConstraint = biomaterialConstraint;
    const expected: TransmartRelationConstraint = {
      type: 'relation',
      relationTypeLabel: 'parent',
      relatedSubjectsConstraint:
        {
          type: 'subselection',
          dimension: 'biomaterial',
          constraint: {
            type: 'and',
            args: [
              {
                type: 'concept',
                conceptCode: 'BIO:TYPE',
              },
              {
                type: 'value',
                valueType: 'string',
                operator: '=',
                value: 'A'
              }
            ]
          }
        } as TransmartSubSelectionConstraint
    };
    testConstraint(parentConstraint, expected);
  });

  it('should serialise "select all female patients with age >= 50"', () => {
    // Female patients
    const genderConstraint = createConceptConstraint(ConceptType.CATEGORICAL, 'PERSON:GENDER');
    const genderValueConstraint = createStringValueConstraint('Female');
    genderConstraint.valueConstraints.push(genderValueConstraint);
    // Age > 50
    const ageConstraint = createConceptConstraint(ConceptType.NUMERICAL, 'PERSON:AGE');
    ageConstraint.valueConstraints.push(ageValueConstraint.clone());
    const combination = new CombinationConstraint(
      [genderConstraint, ageConstraint], CombinationState.And, 'patient');
    const expected: TransmartAndConstraint = {
      type: 'and',
      args: [
        {
          type: 'subselection',
          dimension: 'patient',
          constraint: {
            type: 'and',
            args: [
              {
                type: 'concept',
                conceptCode: 'PERSON:GENDER',
              },
              {
                type: 'value',
                valueType: 'string',
                operator: '=',
                value: 'Female'
              }
            ]
          }
        } as TransmartSubSelectionConstraint,
        {
          type: 'subselection',
          dimension: 'patient',
          constraint: {
            type: 'and',
            args: [
              {
                type: 'concept',
                conceptCode: 'PERSON:AGE',
              },
              {
                type: 'value',
                valueType: 'numeric',
                operator: '>=',
                value: 50
              }
            ]
          }
        } as TransmartSubSelectionConstraint
      ]
    };
    testConstraint(combination, expected);
  });

  it('should serialise pedigree constraints with attributes', () => {
    const conceptConstraint = createConceptConstraint(ConceptType.CATEGORICAL, 'TEST');
    const secondConstraint = createConceptConstraint(ConceptType.CATEGORICAL, 'SECOND');
    const combination = new CombinationConstraint(
      [conceptConstraint, secondConstraint], CombinationState.Or, 'patient');
    const pedigree = new PedigreeConstraint('parent');
    pedigree.rightHandSideConstraint = combination;
    let expected: TransmartRelationConstraint = {
      type: 'relation',
      relationTypeLabel: 'parent',
      relatedSubjectsConstraint: {
        type: 'or',
        args: [
          {
            type: 'subselection',
            dimension: 'patient',
            constraint: {
              type: 'concept',
              conceptCode: 'TEST'
            } as TransmartConceptConstraint
          } as TransmartSubSelectionConstraint,
          {
            type: 'subselection',
            dimension: 'patient',
            constraint: {
              type: 'concept',
              conceptCode: 'SECOND'
            } as TransmartConceptConstraint
          } as TransmartSubSelectionConstraint
        ]
      } as TransmartOrConstraint
    };
    testConstraint(pedigree, expected);

    pedigree.biological = true;
    expected = {
      type: 'relation',
      relationTypeLabel: 'parent',
      biological: true,
      relatedSubjectsConstraint: {
        type: 'or',
        args: [
          {
            type: 'subselection',
            dimension: 'patient',
            constraint: {
              type: 'concept',
              conceptCode: 'TEST'
            } as TransmartConceptConstraint
          } as TransmartSubSelectionConstraint,
          {
            type: 'subselection',
            dimension: 'patient',
            constraint: {
              type: 'concept',
              conceptCode: 'SECOND'
            } as TransmartConceptConstraint
          } as TransmartSubSelectionConstraint
        ]
      } as TransmartOrConstraint
    };
    testConstraint(pedigree, expected);

    pedigree.biological = false;
    pedigree.shareHousehold = true;
    expected = {
      type: 'relation',
      relationTypeLabel: 'parent',
      biological: false,
      shareHousehold: true,
      relatedSubjectsConstraint: {
        type: 'or',
        args: [
          {
            type: 'subselection',
            dimension: 'patient',
            constraint: {
              type: 'concept',
              conceptCode: 'TEST'
            } as TransmartConceptConstraint
          } as TransmartSubSelectionConstraint,
          {
            type: 'subselection',
            dimension: 'patient',
            constraint: {
              type: 'concept',
              conceptCode: 'SECOND'
            } as TransmartConceptConstraint
          } as TransmartSubSelectionConstraint
        ]
      } as TransmartOrConstraint
    };
    testConstraint(pedigree, expected);
  });

  it('should serialise combination constraint with negation and subselection', () => {
    const conceptConstraint = createConceptConstraint(ConceptType.CATEGORICAL, 'TEST');
    const negatedConceptConstraint = createConceptConstraint(ConceptType.CATEGORICAL, 'NEG:TEST');
    negatedConceptConstraint.negated = true;
    const combination = new CombinationConstraint(
      [conceptConstraint, negatedConceptConstraint], CombinationState.And, 'patient');

    const expected: TransmartAndConstraint = {
      type: 'and',
      args: [
        {
          type: 'subselection',
          dimension: 'patient',
          constraint: {
            type: 'concept',
            conceptCode: 'TEST'
          }
        } as TransmartSubSelectionConstraint,
        {
          type: 'subselection',
          dimension: 'patient',
          constraint: {
            type: 'negation',
            arg: {
              type: 'subselection',
              dimension: 'patient',
              constraint: {
                type: 'concept',
                conceptCode: 'NEG:TEST',
              }
            } as TransmartSubSelectionConstraint
          } as TransmartNegationConstraint
        } as TransmartSubSelectionConstraint
      ]
    };
    testConstraint(combination, expected);
  });

  it('should serialise combination with subject and variables constraints', () => {
    // Female patients
    const genderConstraint = createConceptConstraint(ConceptType.CATEGORICAL, 'PERSON:GENDER');
    const genderValueConstraint = createStringValueConstraint('Female');
    genderConstraint.valueConstraints.push(genderValueConstraint);
    // Variables
    const variableConstraint = new CombinationConstraint();
    variableConstraint.combinationState = CombinationState.Or;
    variableConstraint.dimension = 'observation';
    const v1 = createConceptConstraint(ConceptType.NUMERICAL, 'PERSON:AGE');
    const v2 = createConceptConstraint(ConceptType.NUMERICAL, 'PERSON:HEART_RATE');
    variableConstraint.addChild(v1);
    variableConstraint.addChild(v2);
    const combination = new CombinationConstraint(
      [genderConstraint, variableConstraint], CombinationState.And, 'patient');
    const expected: TransmartAndConstraint = {
      type: 'and',
      args: [
        {
          type: 'subselection',
          dimension: 'patient',
          constraint: {
            type: 'and',
            args: [
              {
                type: 'concept',
                conceptCode: 'PERSON:GENDER',
              },
              {
                type: 'value',
                valueType: 'string',
                operator: '=',
                value: 'Female'
              }
            ]
          }
        } as TransmartSubSelectionConstraint,
        {
          type: 'or',
          args: [
            {
              type: 'concept',
              conceptCode: 'PERSON:AGE',
            } as TransmartConceptConstraint,
            {
              type: 'concept',
              conceptCode: 'PERSON:HEART_RATE',
            } as TransmartConceptConstraint,
          ]
        } as TransmartOrConstraint
      ]
    };
    testConstraint(combination, expected);
  });

  it('should serialise combination with subject set and variables constraints', () => {
    // Subject set
    const subjectSetConstraint = new SubjectSetConstraint();
    subjectSetConstraint.id = 12345;
    // Variables
    const variableConstraint = new CombinationConstraint();
    variableConstraint.combinationState = CombinationState.Or;
    variableConstraint.dimension = 'observation';
    const v1 = createConceptConstraint(ConceptType.NUMERICAL, 'PERSON:AGE');
    const v2 = createConceptConstraint(ConceptType.NUMERICAL, 'PERSON:HEART_RATE');
    variableConstraint.addChild(v1);
    variableConstraint.addChild(v2);
    const combination = new CombinationConstraint(
      [subjectSetConstraint, variableConstraint], CombinationState.And, 'patient');
    const expected: TransmartAndConstraint = {
      type: 'and',
      args: [
        {
          type: 'patient_set',
          patientSetId: 12345
        } as TransmartPatientSetConstraint,
        {
          type: 'or',
          args: [
            {
              type: 'concept',
              conceptCode: 'PERSON:AGE',
            } as TransmartConceptConstraint,
            {
              type: 'concept',
              conceptCode: 'PERSON:HEART_RATE',
            } as TransmartConceptConstraint,
          ]
        } as TransmartOrConstraint
      ]
    };
    testConstraint(combination, expected);
  });

  it('should serialise subject set subquery within samples query', () => {
    // Subject set
    const subjectSetConstraint = new SubjectSetConstraint();
    subjectSetConstraint.id = 12345;
    const patientCombination = new CombinationConstraint(
      [subjectSetConstraint], CombinationState.And, 'patient');
    const biomaterialCombination = new CombinationConstraint(
      [patientCombination], CombinationState.And, 'biomaterial');
    const expected: TransmartSubSelectionConstraint = {
      type: 'subselection',
      dimension: 'biomaterial',
      constraint: {
        type: 'patient_set',
        patientSetId: 12345
      } as TransmartPatientSetConstraint
    };
    testConstraint(biomaterialCombination, expected);
  });

  it('should serialise combination of pedigree and concept constraints', () => {
    // Pedigree constraint
    const pedigreeConstraint = new PedigreeConstraint('PARENT');
    const groupConstraint = new ConceptConstraint();
    const groupConcept = new Concept();
    groupConcept.code = 'GROUP';
    groupConstraint.concept = groupConcept;
    pedigreeConstraint.rightHandSideConstraint.addChild(groupConstraint);
    const sportsConstraint = createConceptConstraint(ConceptType.CATEGORICAL, 'Sports');
    const combinationConstraint = new CombinationConstraint(
      [pedigreeConstraint, sportsConstraint], CombinationState.And, 'patient');
    const expected: TransmartAndConstraint = {
      type: 'and',
      args: [
        {
          type: 'relation',
          relationTypeLabel: 'PARENT',
          relatedSubjectsConstraint: {
            type: 'concept',
            conceptCode: 'GROUP'
          } as TransmartConceptConstraint
        } as TransmartRelationConstraint,
        {
          type: 'subselection',
          dimension: 'patient',
          constraint: {
            type: 'concept',
            conceptCode: 'Sports',
          } as TransmartConceptConstraint,
        } as TransmartSubSelectionConstraint
      ]
    };
    testConstraint(combinationConstraint, expected);
  });

  it('should serialise male individuals query', () => {
    const constraint = createConceptConstraint(ConceptType.CATEGORICAL, 'CODE:GENDER');
    const valueConstraint = createStringValueConstraint('male');
    constraint.valueConstraints.push(valueConstraint);

    // Patient selection
    const combination = new CombinationConstraint([constraint], CombinationState.And);
    const expected: TransmartSubSelectionConstraint = {
      type: 'subselection',
      dimension: 'patient',
      constraint: {
        type: 'and',
        args: [
          {
            type: 'concept',
            conceptCode: 'CODE:GENDER'
          } as TransmartConceptConstraint,
          {
            type: 'value',
            valueType: 'string',
            operator: '=',
            value: 'male'
          } as TransmartValueConstraint
        ]
      } as TransmartAndConstraint
    };
    testConstraint(combination, expected);
  });

  it('should serialise individuals with no informed consent query', () => {
    const constraint = createConceptConstraint(ConceptType.CATEGORICAL, 'CODE:INFORMED_CONSENT');
    const valueConstraint = createStringValueConstraint('no');
    constraint.valueConstraints.push(valueConstraint);

    // Patient selection
    const combination = new CombinationConstraint([constraint], CombinationState.And);
    const expected: TransmartSubSelectionConstraint = {
      type: 'subselection',
      dimension: 'patient',
      constraint: {
        type: 'and',
        args: [
          {
            type: 'concept',
            conceptCode: 'CODE:INFORMED_CONSENT'
          } as TransmartConceptConstraint,
          {
            type: 'value',
            valueType: 'string',
            operator: '=',
            value: 'no'
          } as TransmartValueConstraint
        ]
      } as TransmartAndConstraint
    };
    testConstraint(combination, expected);
  });

  it('should serialise individuals with negation of no informed consent query', () => {
    const constraint = createConceptConstraint(ConceptType.CATEGORICAL, 'CODE:INFORMED_CONSENT');
    const valueConstraint = createStringValueConstraint('no');
    constraint.valueConstraints.push(valueConstraint);

    // Patient selection
    const combination = new CombinationConstraint([constraint], CombinationState.And);
    combination.negated = true;
    const expected: TransmartNegationConstraint = {
      type: 'negation',
      arg: {
        type: 'subselection',
        dimension: 'patient',
        constraint:
          {
            type: 'and',
            args: [
              {
                type: 'concept',
                conceptCode: 'CODE:INFORMED_CONSENT'
              } as TransmartConceptConstraint,
              {
                type: 'value',
                valueType: 'string',
                operator: '=',
                value: 'no'
              } as TransmartValueConstraint
            ]
          } as TransmartAndConstraint
      } as TransmartSubSelectionConstraint
    };
    testConstraint(combination, expected);
  });

  it('should serialise male individuals with no informed consent query', () => {
    const constraint1 = createConceptConstraint(ConceptType.CATEGORICAL, 'CODE:GENDER');
    const valueConstraint1 = createStringValueConstraint('male');
    constraint1.valueConstraints.push(valueConstraint1);
    const constraint2 = createConceptConstraint(ConceptType.CATEGORICAL, 'CODE:INFORMED_CONSENT');
    const valueConstraint2 = createStringValueConstraint('no');
    constraint2.valueConstraints.push(valueConstraint2);

    // Patient selection
    const combination = new CombinationConstraint([constraint1, constraint2], CombinationState.And);
    const expected: TransmartAndConstraint = {
      type: 'and',
      args: [
        {
          type: 'subselection',
          dimension: 'patient',
          constraint:
            {
              type: 'and',
              args: [
                {
                  type: 'concept',
                  conceptCode: 'CODE:GENDER'
                } as TransmartConceptConstraint,
                {
                  type: 'value',
                  valueType: 'string',
                  operator: '=',
                  value: 'male'
                } as TransmartValueConstraint
              ]
            } as TransmartAndConstraint
        } as TransmartSubSelectionConstraint,
        {
          type: 'subselection',
          dimension: 'patient',
          constraint:
            {
              type: 'and',
              args: [
                {
                  type: 'concept',
                  conceptCode: 'CODE:INFORMED_CONSENT'
                } as TransmartConceptConstraint,
                {
                  type: 'value',
                  valueType: 'string',
                  operator: '=',
                  value: 'no'
                } as TransmartValueConstraint
              ]
            } as TransmartAndConstraint
        } as TransmartSubSelectionConstraint
      ]
    };
    testConstraint(combination, expected);
  });

  it('should serialise male individuals except with no informed consent query', () => {
    const constraint1 = createConceptConstraint(ConceptType.CATEGORICAL, 'CODE:GENDER');
    const valueConstraint1 = createStringValueConstraint('male');
    constraint1.valueConstraints.push(valueConstraint1);
    const constraint2 = createConceptConstraint(ConceptType.CATEGORICAL, 'CODE:INFORMED_CONSENT');
    const valueConstraint2 = createStringValueConstraint('no');
    constraint2.valueConstraints.push(valueConstraint2);
    constraint2.negated = true;

    // Patient selection
    const combination = new CombinationConstraint([constraint1, constraint2], CombinationState.And);
    const expected: TransmartAndConstraint = {
      type: 'and',
      args: [
        {
          type: 'subselection',
          dimension: 'patient',
          constraint:
            {
              type: 'and',
              args: [
                {
                  type: 'concept',
                  conceptCode: 'CODE:GENDER'
                } as TransmartConceptConstraint,
                {
                  type: 'value',
                  valueType: 'string',
                  operator: '=',
                  value: 'male'
                } as TransmartValueConstraint
              ]
            } as TransmartAndConstraint
        } as TransmartSubSelectionConstraint,
        {
          type: 'subselection',
          dimension: 'patient',
          constraint: {
            type: 'negation',
            arg: {
              type: 'subselection',
              dimension: 'patient',
              constraint:
                {
                  type: 'and',
                  args: [
                    {
                      type: 'concept',
                      conceptCode: 'CODE:INFORMED_CONSENT'
                    } as TransmartConceptConstraint,
                    {
                      type: 'value',
                      valueType: 'string',
                      operator: '=',
                      value: 'no'
                    } as TransmartValueConstraint
                  ]
                } as TransmartAndConstraint
            } as TransmartSubSelectionConstraint
          } as TransmartNegationConstraint
        } as TransmartSubSelectionConstraint
      ]
    };
    testConstraint(combination, expected);
  });

  it('should serialise "individuals with diagnosis"', () => {
    // Patient selection
    const combination = new CombinationConstraint([
      new CombinationConstraint([new TrueConstraint()], CombinationState.And, 'diagnosis')
    ], CombinationState.And);
    const expected: TransmartSubSelectionConstraint = {
      type: 'subselection',
      dimension: 'patient',
      constraint: {
        type: 'subselection',
        dimension: 'diagnosis',
        constraint:
          {
            type: 'true'
          }
      } as TransmartSubSelectionConstraint
    };
    testConstraint(combination, expected);
  });

  it('should serialise "individuals with neuroblastoma diagnosis"', () => {
    const tumorType = createConceptConstraint(ConceptType.CATEGORICAL, 'TUMOR_TYPE');
    tumorType.valueConstraints.push(createStringValueConstraint('neuroblastoma'));
    // Patient selection
    const combination = new CombinationConstraint([
      new CombinationConstraint([tumorType], CombinationState.And, 'diagnosis')
    ], CombinationState.And);
    const expected: TransmartSubSelectionConstraint = {
      type: 'subselection',
      dimension: 'patient',
      constraint: {
        type: 'subselection',
        dimension: 'diagnosis',
        constraint:
          {
            type: 'and',
            args: [
              {
                type: 'concept',
                conceptCode: 'TUMOR_TYPE'
              } as TransmartConceptConstraint,
              {
                type: 'value',
                valueType: 'string',
                operator: '=',
                value: 'neuroblastoma'
              } as TransmartValueConstraint
            ]
          } as TransmartAndConstraint
      } as TransmartSubSelectionConstraint
    };
    testConstraint(combination, expected);
  });

  it('should serialise "individuals with stage II neuroblastoma diagnosis"', () => {
    const tumorType = createConceptConstraint(ConceptType.CATEGORICAL, 'TUMOR_TYPE');
    tumorType.valueConstraints.push(createStringValueConstraint('neuroblastoma'));
    const tumorStage = createConceptConstraint(ConceptType.CATEGORICAL, 'TUMOR_STAGE');
    tumorStage.valueConstraints.push(createStringValueConstraint('II'));
    // Patient selection
    const combination = new CombinationConstraint([
      new CombinationConstraint([tumorType, tumorStage], CombinationState.And, 'diagnosis')
    ], CombinationState.And);
    const expected: TransmartSubSelectionConstraint = {
      type: 'subselection',
      dimension: 'patient',
      constraint: {
        type: 'and',
        args: [
          {
            type: 'subselection',
            dimension: 'diagnosis',
            constraint:
              {
                type: 'and',
                args: [
                  {
                    type: 'concept',
                    conceptCode: 'TUMOR_TYPE'
                  } as TransmartConceptConstraint,
                  {
                    type: 'value',
                    valueType: 'string',
                    operator: '=',
                    value: 'neuroblastoma'
                  } as TransmartValueConstraint
                ]
              } as TransmartAndConstraint
          } as TransmartSubSelectionConstraint,
          {
            type: 'subselection',
            dimension: 'diagnosis',
            constraint:
              {
                type: 'and',
                args: [
                  {
                    type: 'concept',
                    conceptCode: 'TUMOR_STAGE'
                  } as TransmartConceptConstraint,
                  {
                    type: 'value',
                    valueType: 'string',
                    operator: '=',
                    value: 'II'
                  } as TransmartValueConstraint
                ]
              } as TransmartAndConstraint
          } as TransmartSubSelectionConstraint
        ]
      } as TransmartAndConstraint
    };
    testConstraint(combination, expected);
  });

  it('should serialise "individuals with neuroblastoma diagnosis except stage II"', () => {
    const tumorType = createConceptConstraint(ConceptType.CATEGORICAL, 'TUMOR_TYPE');
    tumorType.valueConstraints.push(createStringValueConstraint('neuroblastoma'));
    const tumorStage = createConceptConstraint(ConceptType.CATEGORICAL, 'TUMOR_STAGE');
    tumorStage.valueConstraints.push(createStringValueConstraint('II'));
    tumorStage.negated = true;
    // Patient selection
    const combination = new CombinationConstraint([
      new CombinationConstraint([tumorType, tumorStage], CombinationState.And, 'diagnosis')
    ], CombinationState.And);
    const expected: TransmartSubSelectionConstraint = {
      type: 'subselection',
      dimension: 'patient',
      constraint: {
        type: 'and',
        args: [
          {
            type: 'subselection',
            dimension: 'diagnosis',
            constraint:
              {
                type: 'and',
                args: [
                  {
                    type: 'concept',
                    conceptCode: 'TUMOR_TYPE'
                  } as TransmartConceptConstraint,
                  {
                    type: 'value',
                    valueType: 'string',
                    operator: '=',
                    value: 'neuroblastoma'
                  } as TransmartValueConstraint
                ]
              } as TransmartAndConstraint
          } as TransmartSubSelectionConstraint,
          {
            type: 'subselection',
            dimension: 'diagnosis',
            constraint: {
              type: 'negation',
              arg: {
                type: 'subselection',
                dimension: 'diagnosis',
                constraint:
                  {
                    type: 'and',
                    args: [
                      {
                        type: 'concept',
                        conceptCode: 'TUMOR_STAGE'
                      } as TransmartConceptConstraint,
                      {
                        type: 'value',
                        valueType: 'string',
                        operator: '=',
                        value: 'II'
                      } as TransmartValueConstraint
                    ]
                  } as TransmartAndConstraint
              } as TransmartSubSelectionConstraint
            } as TransmartNegationConstraint
          } as TransmartSubSelectionConstraint
        ]
      } as TransmartAndConstraint
    };
    testConstraint(combination, expected);
  });

  it('should serialise "all diagnoses"', () => {
    // Diagnosis set
    const diagnosisCombination = new CombinationConstraint([new TrueConstraint()], CombinationState.And, 'diagnosis');
    const expected: TransmartSubSelectionConstraint = {
      type: 'subselection',
      dimension: 'diagnosis',
      constraint: {
        type: 'true'
      }
    };
    testConstraint(diagnosisCombination, expected);
  });

  it('should serialise "all neuroblastoma diagnoses"', () => {
    const tumorTypeConstraint = createConceptConstraint(ConceptType.CATEGORICAL, 'CODE:TUMOR_TYPE');
    const tumorTypeValueConstraint = createStringValueConstraint('neuroblastoma');
    tumorTypeConstraint.valueConstraints.push(tumorTypeValueConstraint);

    // Diagnosis set
    const diagnosisCombination = new CombinationConstraint(
      [tumorTypeConstraint], CombinationState.And, 'diagnosis');
    const expected: TransmartSubSelectionConstraint = {
      type: 'subselection',
      dimension: 'diagnosis',
      constraint: {
        type: 'and',
        args: [
          {
            type: 'concept',
            conceptCode: 'CODE:TUMOR_TYPE'
          },
          {
            type: 'value',
            valueType: 'string',
            operator: '=',
            value: 'neuroblastoma'
          } as TransmartValueConstraint
        ]
      } as TransmartAndConstraint
    };
    testConstraint(diagnosisCombination, expected);
  });

  it('should serialise "all diagnoses except neuroblastoma"', () => {
    const tumorTypeConstraint = createConceptConstraint(ConceptType.CATEGORICAL, 'CODE:TUMOR_TYPE');
    const tumorTypeValueConstraint = createStringValueConstraint('neuroblastoma');
    tumorTypeConstraint.valueConstraints.push(tumorTypeValueConstraint);
    tumorTypeConstraint.negated = true;

    // Diagnosis set
    const diagnosisCombination = new CombinationConstraint(
      [tumorTypeConstraint], CombinationState.And, 'diagnosis');
    const expected: TransmartSubSelectionConstraint = {
      type: 'subselection',
      dimension: 'diagnosis',
      constraint: {
        type: 'negation',
        arg: {
          type: 'subselection',
          dimension: 'diagnosis',
          constraint: {
            type: 'and',
            args: [
              {
                type: 'concept',
                conceptCode: 'CODE:TUMOR_TYPE'
              },
              {
                type: 'value',
                valueType: 'string',
                operator: '=',
                value: 'neuroblastoma'
              } as TransmartValueConstraint
            ]
          } as TransmartAndConstraint
        } as TransmartSubSelectionConstraint
      } as TransmartNegationConstraint
    };
    testConstraint(diagnosisCombination, expected);
  });

});
