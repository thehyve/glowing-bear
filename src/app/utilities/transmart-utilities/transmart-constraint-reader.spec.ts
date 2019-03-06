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

describe('TransmartConstraintReader', () => {

  const reader = new TransmartConstraintReader();
  const serialiser = new TransmartConstraintSerialiser(true);

  function testConstraint(constraint: Constraint) {
    const serialisedConstraint = JSON.parse(JSON.stringify(serialiser.visit(constraint)));
    const importedConstraint = reader.visit(serialisedConstraint);
    const serialisedImportedConstraint = JSON.parse(JSON.stringify(serialiser.visit(importedConstraint)));
    if (serialisedImportedConstraint !== serialisedConstraint) {
      console.error('Serialised', JSON.stringify(serialisedConstraint));
      console.error('Imported', JSON.stringify(serialisedImportedConstraint));
    }
    expect(serialisedImportedConstraint).toEqual(serialisedConstraint);
  }

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
    concept.fullName = '\\Test studies\\TEST';
    constraint.concept = concept;
    const valueConstraint = new ValueConstraint();
    valueConstraint.operator = '=';
    valueConstraint.valueType = 'NUMERIC';
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
    const observedDateConstraint = new TimeConstraint('<');
    observedDateConstraint.isObservationDate = false;
    observedDateConstraint.date1 = new Date();
    constraint.valDateConstraint = observedDateConstraint;
    constraint.applyValDateConstraint = true;
    testConstraint(constraint);
  });

  it('should correctly (de)serialise concept constraints with start date', () => {
    const constraint = createConceptConstraint();
    const startDateConstraint = new TimeConstraint('<');
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

});
