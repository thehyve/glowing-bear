import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {Concept} from '../../models/constraint-models/concept';
import {ConceptType} from '../../models/constraint-models/concept-type';
import {ValueConstraint} from '../../models/constraint-models/value-constraint';
import {
  TransmartAndConstraint,
  TransmartConstraint,
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

describe('TransmartConstraintSerialiser', () => {

  const serialiser = new TransmartConstraintSerialiser(false);

  function testConstraint(constraint: Constraint, expected: TransmartConstraint) {
    const serialisedConstraint = JSON.parse(JSON.stringify(serialiser.visit(constraint)));
    const expectedConstraint = JSON.parse(JSON.stringify(expected));
    if (JSON.stringify(serialisedConstraint) !== JSON.stringify(expectedConstraint)) {
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
    const patientConstraint = new CombinationConstraint(
      [biomaterialConstraint], CombinationState.And, 'patient');
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
    testConstraint(patientConstraint, expected);
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

});
