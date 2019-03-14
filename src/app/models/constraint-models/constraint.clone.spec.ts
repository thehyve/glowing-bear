import {Constraint} from './constraint';
import {ConstraintSerialiser} from '../../utilities/constraint-utilities/constraint-serialiser';
import {TrueConstraint} from './true-constraint';
import {ValueConstraint} from './value-constraint';
import {TrialVisitConstraint} from './trial-visit-constraint';
import {TimeConstraint} from './time-constraint';
import {SubjectSetConstraint} from './subject-set-constraint';
import {StudyConstraint} from './study-constraint';
import {PedigreeConstraint} from './pedigree-constraint';
import {CombinationConstraint} from './combination-constraint';
import {ConceptConstraint} from './concept-constraint';
import {TrialVisit} from './trial-visit';
import {Study} from './study';
import {Concept} from './concept';

describe('Constraint.clone', () => {

  function testConstraint(constraint: Constraint) {
    const serialisedConstraint = ConstraintSerialiser.serialise(constraint);
    const copy = constraint.clone();
    const serialisedCopy = ConstraintSerialiser.serialise(copy);
    expect(serialisedCopy).toEqual(serialisedConstraint);
  }

  it('should clone combination constraint', () => {
    const constraint = new CombinationConstraint();
    const studyConstraint = new StudyConstraint();
    const study = new Study();
    study.id = 'STUDY';
    studyConstraint.studies.push(study);
    constraint.addChild(studyConstraint);
    constraint.negated = true;
    testConstraint(constraint);
  });

  it('should clone concept constraint', () => {
    const constraint = new ConceptConstraint();
    const concept = new Concept();
    concept.code = 'ABC';
    concept.fullName = '\\Concepts\\ABC\\';
    constraint.concept = concept;
    constraint.valueConstraints.push(new ValueConstraint());
    constraint.valDateConstraint = new TimeConstraint();
    constraint.applyValDateConstraint = true;
    testConstraint(constraint);

    constraint.applyValDateConstraint = false;
    constraint.applyObsDateConstraint = true;
    constraint.obsDateConstraint = new TimeConstraint();
    constraint.trialVisitConstraint = new TrialVisitConstraint();
    constraint.applyTrialVisitConstraint = true;
    testConstraint(constraint);
  });

  it('should clone negation constraint', () => {
    const constraint = new ValueConstraint();
    constraint.negated = true;
    testConstraint(constraint);
  });

  it('should clone pedigree constraint', () => {
    const constraint = new PedigreeConstraint('parent');
    testConstraint(constraint);
  });
  it('should clone study constraint', () => {
    const constraint = new StudyConstraint();
    const studyA = new Study();
    studyA.id = 'A';
    constraint.studies.push(studyA);
    const studyB = new Study();
    studyB.id = 'B';
    constraint.studies.push(studyB);
    testConstraint(constraint);
  });

  it('should clone subject set constraint', () => {
    const constraint = new SubjectSetConstraint();
    testConstraint(constraint);
  });

  it('should clone time constraint', () => {
    const constraint = new TimeConstraint();
    testConstraint(constraint);

  });

  it('should clone trial visit constraint', () => {
    const constraint = new TrialVisitConstraint();
    const trialVisit = new TrialVisit();
    trialVisit.label = 'Week 1';
    constraint.trialVisits.push(trialVisit);
    testConstraint(constraint);
  });

  it('should clone true constraint', () => {
    testConstraint(new TrueConstraint());
  });

  it('should clone value constraint', () => {
    const constraint = new ValueConstraint();
    testConstraint(constraint);
  });

});
