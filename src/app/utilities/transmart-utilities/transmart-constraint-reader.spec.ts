import {TransmartConstraintReader} from './transmart-constraint-reader';
import {TransmartConstraintSerialiser} from './transmart-constraint-serialiser';
import {TrueConstraint} from '../../models/constraint-models/true-constraint';
import {StudyConstraint} from '../../models/constraint-models/study-constraint';
import {Study} from '../../models/constraint-models/study';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {NegationConstraint} from '../../models/constraint-models/negation-constraint';
import {PedigreeConstraint} from '../../models/constraint-models/pedigree-constraint';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {Concept} from '../../models/constraint-models/concept';
import {ValueConstraint} from '../../models/constraint-models/value-constraint';
import {CombinationState} from '../../models/constraint-models/combination-state';
import {Constraint} from '../../models/constraint-models/constraint';
import {TrialVisitConstraint} from '../../models/constraint-models/trial-visit-constraint';
import {TrialVisit} from '../../models/constraint-models/trial-visit';
import {TimeConstraint} from '../../models/constraint-models/time-constraint';
import {SubjectSetConstraint} from '../../models/constraint-models/subject-set-constraint';
import {SubjectSet} from '../../models/constraint-models/subject-set';
import {DateOperatorState} from '../../models/constraint-models/date-operator-state';
import {Operator} from '../../models/constraint-models/operator';
import {ValueType} from '../../models/constraint-models/value-type';
import {ConceptType} from '../../models/constraint-models/concept-type';
import deepEqual = require('deep-equal');
import {ConstraintSerialiser} from '../constraint-utilities/constraint-serialiser';

describe('TransmartConstraintReader', () => {

  const reader = new TransmartConstraintReader();
  const serialiser = new TransmartConstraintSerialiser(true);

  function testConstraint(constraint: Constraint) {
    const serialisedConstraint = JSON.parse(JSON.stringify(serialiser.visit(constraint)));
    const importedConstraint = reader.visit(serialisedConstraint);
    const serialisedImportedConstraint = JSON.parse(JSON.stringify(serialiser.visit(importedConstraint)));
    if (!deepEqual(serialisedImportedConstraint, serialisedConstraint)) {
      console.error('Serialised', JSON.stringify(serialisedImportedConstraint, null, 2));
      console.error('Expected', JSON.stringify(serialisedConstraint, null, 2));
    }
    expect(serialisedImportedConstraint).toEqual(serialisedConstraint);
  }

  it('should (de)serialise null or undefined to null', () => {
    expect(serialiser.visit(null)).toBeNull();
    expect(serialiser.visit(undefined)).toBeNull();
    expect(reader.visit(null)).toBeNull();
    expect(reader.visit(undefined)).toBeNull();
  });

  it('should correctly (de)serialise true constraints', () => {
    const constraint = new TrueConstraint();
    testConstraint(constraint);
  });

  it('should correctly (de)serialise study constraints', () => {
    const constraint = new StudyConstraint();
    const studyA = new Study();
    studyA.id = 'A';
    const studyB = new Study();
    studyB.id = 'B';
    constraint.studies.push(studyA);
    constraint.studies.push(studyB);
    testConstraint(constraint);
  });

  function createConceptConstraint(): ConceptConstraint {
    const constraint = new ConceptConstraint();
    const concept = new Concept();
    concept.code = 'TEST';
    concept.type = ConceptType.NUMERICAL;
    concept.fullName = '\\Test studies\\TEST';
    constraint.concept = concept;
    const valueConstraint = new ValueConstraint();
    valueConstraint.operator = <Operator>'=';
    valueConstraint.valueType = <ValueType>'numeric';
    valueConstraint.value = 3;
    constraint.valueConstraints.push(valueConstraint);
    return constraint;
  }

  function createCombinationConstraint(): CombinationConstraint {
    const constraint = new CombinationConstraint();
    constraint.combinationState = CombinationState.And;
    constraint.addChild(createConceptConstraint());
    constraint.addChild(new TrueConstraint());
    return constraint;
  }

  it('should correctly (de)serialise pedigree constraints', () => {
    const constraint = new PedigreeConstraint('parent');
    constraint.rightHandSideConstraint = createCombinationConstraint();
    testConstraint(constraint);

    constraint.rightHandSideConstraint = new CombinationConstraint([]);
    testConstraint(constraint);

    const studyConstraint = new StudyConstraint();
    const study = new Study();
    study.id = 'A';
    studyConstraint.studies.push(study);
    constraint.rightHandSideConstraint.addChild(studyConstraint);
    testConstraint(constraint);
  });

  it('should correctly (de)serialise negation constraints', () => {
    const constraint = new NegationConstraint(createConceptConstraint());
    testConstraint(constraint);
  });

  it('should correctly (de)serialise combination constraints', () => {
    const constraint = createCombinationConstraint();
    testConstraint(constraint);
  });

  it('should correctly (de)serialise empty disjunction constraints', () => {
    const constraint = new CombinationConstraint();
    constraint.combinationState = CombinationState.Or;
    testConstraint(constraint);
  });

  it('should correctly (de)serialise empty conjunction constraints', () => {
    const constraint = new CombinationConstraint();
    constraint.combinationState = CombinationState.And;
    testConstraint(constraint);
  });

  it('should correctly (de)serialise singleton combination constraints', () => {
    const constraint = new CombinationConstraint();
    constraint.combinationState = CombinationState.Or;
    constraint.addChild(createConceptConstraint());
    testConstraint(constraint);
  });

  it('should correctly (de)serialise dimension combination constraints', () => {
    const sampleConstraint = createCombinationConstraint();
    sampleConstraint.dimension = 'sample';
    const constraint = new CombinationConstraint();
    constraint.combinationState = CombinationState.And;
    constraint.dimension = 'patient';
    constraint.addChild(sampleConstraint);
    testConstraint(constraint);
  });

  it('should correctly (de)serialise concept constraints', () => {
    const constraint = createConceptConstraint();
    testConstraint(constraint);
  });

  it('should correctly (de)serialise concept constraints with observed date', () => {
    const constraint = createConceptConstraint();
    const observedDateConstraint = new TimeConstraint();
    observedDateConstraint.dateOperator = DateOperatorState.BEFORE;
    observedDateConstraint.isObservationDate = false;
    observedDateConstraint.date1 = new Date();
    constraint.valDateConstraint = observedDateConstraint;
    constraint.applyValDateConstraint = true;
    testConstraint(constraint);
  });

  it('should correctly (de)serialise concept constraints with start date', () => {
    const constraint = createConceptConstraint();
    const startDateConstraint = new TimeConstraint();
    startDateConstraint.dateOperator = DateOperatorState.AFTER;
    startDateConstraint.isObservationDate = true;
    startDateConstraint.date1 = new Date();
    constraint.obsDateConstraint = startDateConstraint;
    constraint.applyObsDateConstraint = true;
    testConstraint(constraint);
  });

  it('should correctly (de)serialise concept constraints with negated start date', () => {
    const constraint = createConceptConstraint();
    const startDateConstraint = new TimeConstraint();
    startDateConstraint.dateOperator = DateOperatorState.NOT_BETWEEN;
    startDateConstraint.isObservationDate = true;
    startDateConstraint.date1 = new Date();
    constraint.obsDateConstraint = startDateConstraint;
    constraint.applyObsDateConstraint = true;
    testConstraint(constraint);
  });

  it('should correctly (de)serialise concept constraints with trial visit', () => {
    const constraint = createConceptConstraint();
    const trialVisit = new TrialVisit('12345');
    trialVisit.relTime = 1;
    const trialVisitConstraint = new TrialVisitConstraint();
    trialVisitConstraint.trialVisits.push(trialVisit);
    constraint.trialVisitConstraint = trialVisitConstraint;
    constraint.applyTrialVisitConstraint = true;
    testConstraint(constraint);
  });

  it('should correctly (de)serialise concept constraints with study', () => {
    const constraint = createConceptConstraint();
    const studyConstraint = new StudyConstraint();
    constraint.studyConstraint = studyConstraint;
    constraint.applyStudyConstraint = true;
    testConstraint(constraint);

    const studyA = new Study();
    studyA.id = 'TEST_STUDY_A';
    studyConstraint.studies.push(studyA);
    testConstraint(constraint);

    const studyB = new Study();
    studyB.id = 'TEST_STUDY_B';
    studyConstraint.studies.push(studyB);
    testConstraint(constraint);
  });

  it('should correctly (de)serialise patient set constraints', () => {
    const subjectSet = new SubjectSet();
    subjectSet.id = 12345;
    const constraint = new SubjectSetConstraint(subjectSet);
    testConstraint(constraint);
  });

  it('should correctly (de)serialise patient set constraints with subject ids', () => {
    const constraint = new SubjectSetConstraint(null);
    constraint.subjectIds = ['SUBJ1', 'SUBJ2'];
    testConstraint(constraint);
  });

  it('should correctly (de)serialise patient set constraints with patient ids', () => {
    const constraint = new SubjectSetConstraint(null);
    constraint.patientIds = ['12345', '23456'];
    testConstraint(constraint);
  });

  it('should correctly (de)serialise subselection with negated study constraint', () => {
    const studyConstraint = new StudyConstraint();
    const study = new Study();
    study.id = 'ABC';
    studyConstraint.studies.push(study);
    studyConstraint.negated = true;
    const constraint = new CombinationConstraint([
      studyConstraint
    ], CombinationState.And, 'biomaterial');
    testConstraint(constraint);
  });

  it('should correctly (de)serialise subselection with multiple constraints', () => {
    const studyConstraint1 = new StudyConstraint();
    const study1 = new Study();
    study1.id = 'ABC';
    studyConstraint1.studies.push(study1);
    const studyConstraint2 = new StudyConstraint();
    const study2 = new Study();
    study2.id = 'DEF';
    studyConstraint1.studies.push(study2);
    const constraint = new CombinationConstraint(
      [studyConstraint1, studyConstraint2], CombinationState.Or, 'biomaterial');
    testConstraint(constraint);
  });

  it('should correctly (de)serialise subselection with nested subselections', () => {
    const studyConstraint11 = new StudyConstraint();
    const study11 = new Study();
    study11.id = 'ABC1';
    studyConstraint11.studies.push(study11);
    const studyConstraint12 = new StudyConstraint();
    const study12 = new Study();
    study12.id = 'ABC2';
    studyConstraint12.studies.push(study12);
    const subselectionConstraint1 = new CombinationConstraint(
      [studyConstraint11, studyConstraint12], CombinationState.And, 'patient');

    const studyConstraint2 = new StudyConstraint();
    const study2 = new Study();
    study2.id = 'DEF';
    studyConstraint2.studies.push(study2);

    const constraint = new CombinationConstraint(
      [subselectionConstraint1, studyConstraint2], CombinationState.Or, 'patient');
    testConstraint(constraint);
  });

  it('should correctly (de)serialise empty diagnosis constraint', () => {
    const constraint = new CombinationConstraint(
      [], CombinationState.And, 'diagnosis');
    testConstraint(constraint);
  });

  it('should correctly (de)serialise singleton diagnosis constraint', () => {
    const conceptConstraint = createConceptConstraint();
    const constraint = new CombinationConstraint(
      [conceptConstraint], CombinationState.And, 'diagnosis');
    testConstraint(constraint);
  });

  it('should correctly (de)serialise negated diagnosis constraint', () => {
    const conceptConstraint = createConceptConstraint();
    conceptConstraint.negated = true;
    const constraint = new CombinationConstraint(
      [conceptConstraint], CombinationState.And, 'diagnosis');
    testConstraint(constraint);
  });

  it('should correctly (de)serialise combination with negated diagnosis constraint', () => {
    const tumorType = new ConceptConstraint();
    tumorType.concept = new Concept();
    tumorType.concept.code = 'TUMOR_TYPE';
    tumorType.concept.fullName = '\\Test studies\\Tumor type';
    tumorType.concept.type = ConceptType.CATEGORICAL;
    const tumorTypeValue = new ValueConstraint();
    tumorTypeValue.valueType = ValueType.string;
    tumorTypeValue.operator = Operator.eq;
    tumorTypeValue.value = 'neuroblastoma';
    tumorType.valueConstraints.push(tumorTypeValue);
    const negatedTumorStage = new ConceptConstraint();
    negatedTumorStage.concept = new Concept();
    negatedTumorStage.concept.type = ConceptType.CATEGORICAL;
    negatedTumorStage.concept.code = 'TUMOR_STAGE';
    negatedTumorStage.concept.fullName = '\\Test studies\\Tumor stage';
    const tumorStageValue = new ValueConstraint();
    tumorStageValue.valueType = ValueType.string;
    tumorStageValue.operator = Operator.eq;
    tumorStageValue.value = 'II';
    negatedTumorStage.valueConstraints.push(tumorStageValue);
    negatedTumorStage.negated = true;
    const constraint = new CombinationConstraint([negatedTumorStage, tumorType], CombinationState.And, 'diagnosis');
    testConstraint(constraint);
  });

  it('reads correctly negated constraints', () => {
    const constraint = {
      type: 'subselection',
      dimension: 'diagnosis',
      constraint: {
        type: 'negation',
        arg: {
          type: 'subselection',
          dimension: 'diagnosis',
          constraint: {
            type: 'concept',
            conceptCode: 'TUMOR_STAGE'
          },
        }
      }
    };
    const result = new TransmartConstraintReader().visit(constraint);

    const negatedTumorStage = new ConceptConstraint();
    negatedTumorStage.concept = new Concept();
    negatedTumorStage.concept.code = 'TUMOR_STAGE';
    negatedTumorStage.negated = true;
    const expected = new CombinationConstraint([negatedTumorStage], CombinationState.And, 'diagnosis');

    expect(ConstraintSerialiser.serialise(result)).toEqual(ConstraintSerialiser.serialise(expected));
  });

  it('reads correctly combination with negated constraint', () => {
    const constraint = {
      type: 'and',
      args: [
        {
          type: 'subselection',
          dimension: 'diagnosis',
          constraint: {
            type: 'concept',
            conceptCode: 'TUMOR_TYPE'
          }
        },
        {
          type: 'subselection',
          dimension: 'diagnosis',
          constraint: {
            type: 'negation',
            arg: {
              type: 'subselection',
              dimension: 'diagnosis',
              constraint: {
                type: 'concept',
                conceptCode: 'TUMOR_STAGE'
              },
            }
          }
        }
      ]
    };
    const result = new TransmartConstraintReader().visit(constraint);

    const tumorType = new ConceptConstraint();
    tumorType.concept = new Concept();
    tumorType.concept.code = 'TUMOR_TYPE';
    const negatedTumorStage = new ConceptConstraint();
    negatedTumorStage.concept = new Concept();
    negatedTumorStage.concept.code = 'TUMOR_STAGE';
    negatedTumorStage.negated = true;
    const expected = new CombinationConstraint([tumorType, negatedTumorStage], CombinationState.And, 'diagnosis');

    expect(ConstraintSerialiser.serialise(result)).toEqual(ConstraintSerialiser.serialise(expected));
  });

});
