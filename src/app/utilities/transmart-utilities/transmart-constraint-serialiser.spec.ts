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

  it('should serialise "select all biomaterials for patients with age >= 50"', () => {
    const ageConstraint = new ConceptConstraint();
    const ageConcept = new Concept();
    ageConcept.code = 'CODE:AGE';
    ageConcept.name = 'Age';
    ageConcept.fullName = '\\Personal\\Age\\';
    ageConstraint.concept = ageConcept;
    ageConcept.type = ConceptType.NUMERICAL;
    const ageValueConstraint = new ValueConstraint();
    ageValueConstraint.operator = Operator.geq;
    ageValueConstraint.valueType = ValueType.numeric;
    ageValueConstraint.value = 50;
    ageConstraint.valueConstraints.push(ageValueConstraint);
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
    const ageConstraint = new ConceptConstraint();
    const ageConcept = new Concept();
    ageConcept.code = 'CODE:AGE';
    ageConcept.type = ConceptType.NUMERICAL;
    ageConstraint.concept = ageConcept;
    const ageValueConstraint = new ValueConstraint();
    ageValueConstraint.operator = Operator.geq;
    ageValueConstraint.valueType = ValueType.numeric;
    ageValueConstraint.value = 50;
    ageConstraint.valueConstraints.push(ageValueConstraint);
    const patientAgeConstraint = new CombinationConstraint(
      [ageConstraint], CombinationState.And, 'patient');
    const typeConstraint = new ConceptConstraint();
    const typeConcept = new Concept();
    typeConcept.code = 'BIO:TYPE';
    typeConcept.type = ConceptType.CATEGORICAL;
    typeConstraint.concept = typeConcept;
    const typeValueConstraint = new ValueConstraint();
    typeValueConstraint.operator = Operator.eq;
    typeValueConstraint.valueType = ValueType.string;
    typeValueConstraint.value = 'A';
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
    const typeConstraint = new ConceptConstraint();
    const typeConcept = new Concept();
    typeConcept.code = 'BIO:TYPE';
    typeConcept.type = ConceptType.CATEGORICAL;
    typeConstraint.concept = typeConcept;
    const typeValueConstraint = new ValueConstraint();
    typeValueConstraint.operator = Operator.eq;
    typeValueConstraint.valueType = ValueType.string;
    typeValueConstraint.value = 'A';
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
    const typeConstraint = new ConceptConstraint();
    const typeConcept = new Concept();
    typeConcept.code = 'BIO:TYPE';
    typeConcept.type = ConceptType.CATEGORICAL;
    typeConstraint.concept = typeConcept;
    const typeValueConstraint = new ValueConstraint();
    typeValueConstraint.operator = Operator.eq;
    typeValueConstraint.valueType = ValueType.string;
    typeValueConstraint.value = 'A';
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

  it('should serialise "select all female patients with age > 50"', () => {
    // Female patients
    const genderConstraint = new ConceptConstraint();
    const genderConcept = new Concept();
    genderConcept.code = 'PERSON:GENDER';
    genderConcept.type = ConceptType.CATEGORICAL;
    genderConstraint.concept = genderConcept;
    const genderValueConstraint = new ValueConstraint();
    genderValueConstraint.operator = Operator.eq;
    genderValueConstraint.valueType = ValueType.string;
    genderValueConstraint.value = 'Female';
    genderConstraint.valueConstraints.push(genderValueConstraint);
    // Age > 50
    const ageConstraint = new ConceptConstraint();
    const ageConcept = new Concept();
    ageConcept.code = 'PERSON:AGE';
    ageConcept.type = ConceptType.NUMERICAL;
    ageConstraint.concept = ageConcept;
    const ageValueConstraint = new ValueConstraint();
    ageValueConstraint.operator = Operator.gt;
    ageValueConstraint.valueType = ValueType.numeric;
    ageValueConstraint.value = 50;
    ageConstraint.valueConstraints.push(ageValueConstraint);
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
                operator: '>',
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
    const conceptConstraint = new ConceptConstraint();
    const concept = new Concept();
    concept.code = 'TEST';
    conceptConstraint.concept = concept;
    const secondConstraint = new ConceptConstraint();
    const secondConcept = new Concept();
    secondConcept.code = 'SECOND';
    secondConstraint.concept = secondConcept;
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
    const conceptConstraint = new ConceptConstraint();
    const concept1 = new Concept();
    concept1.code = 'TEST';
    conceptConstraint.concept = concept1;

    const negatedConceptConstraint = new ConceptConstraint();
    negatedConceptConstraint.negated = true;
    const concept2 = new Concept();
    concept2.code = 'NEG:TEST';
    negatedConceptConstraint.concept = concept2;
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
      ]
    };
    testConstraint(combination, expected);
  });

  it('should serialise combination with subject and variables constraints', () => {
    // Female patients
    const genderConstraint = new ConceptConstraint();
    const genderConcept = new Concept();
    genderConcept.code = 'PERSON:GENDER';
    genderConcept.type = ConceptType.CATEGORICAL;
    genderConstraint.concept = genderConcept;
    const genderValueConstraint = new ValueConstraint();
    genderValueConstraint.operator = Operator.eq;
    genderValueConstraint.valueType = ValueType.string;
    genderValueConstraint.value = 'Female';
    genderConstraint.valueConstraints.push(genderValueConstraint);
    // Variables
    const variableConstraint = new CombinationConstraint();
    variableConstraint.combinationState = CombinationState.Or;
    variableConstraint.dimension = 'observation';
    const v1 = new ConceptConstraint();
    const variable1 = new Concept();
    variable1.code = 'PERSON:AGE';
    variable1.type = ConceptType.NUMERICAL;
    v1.concept = variable1;
    const v2 = new ConceptConstraint();
    const variable2 = new Concept();
    variable2.code = 'PERSON:HEART_RATE';
    variable2.type = ConceptType.NUMERICAL;
    v2.concept = variable2;
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
    const v1 = new ConceptConstraint();
    const variable1 = new Concept();
    variable1.code = 'PERSON:AGE';
    variable1.type = ConceptType.NUMERICAL;
    v1.concept = variable1;
    const v2 = new ConceptConstraint();
    const variable2 = new Concept();
    variable2.code = 'PERSON:HEART_RATE';
    variable2.type = ConceptType.NUMERICAL;
    v2.concept = variable2;
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
    const sportsConcept = new Concept();
    sportsConcept.code = 'Sports';
    const sportsConstraint = new ConceptConstraint();
    sportsConstraint.concept = sportsConcept;
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

});
