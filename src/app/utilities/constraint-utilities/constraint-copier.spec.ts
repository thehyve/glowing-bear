import {Constraint} from '../../models/constraint-models/constraint';
import {ConstraintSerialiser} from './constraint-serialiser';
import {ConstraintCopier} from './constraint-copier';
import {TrueConstraint} from '../../models/constraint-models/true-constraint';
import {ValueConstraint} from '../../models/constraint-models/value-constraint';
import {TrialVisitConstraint} from '../../models/constraint-models/trial-visit-constraint';
import {TimeConstraint} from '../../models/constraint-models/time-constraint';
import {SubjectSetConstraint} from '../../models/constraint-models/subject-set-constraint';
import {StudyConstraint} from '../../models/constraint-models/study-constraint';
import {PedigreeConstraint} from '../../models/constraint-models/pedigree-constraint';
import {NegationConstraint} from '../../models/constraint-models/negation-constraint';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {TrialVisit} from '../../models/constraint-models/trial-visit';
import {Study} from '../../models/constraint-models/study';
import {Concept} from '../../models/constraint-models/concept';

describe('ConstraintCopier', () => {

  function testConstraint(constraint: Constraint) {
    const serialisedConstraint = ConstraintSerialiser.serialise(constraint);
    const copy = ConstraintCopier.copy(constraint);
    const serialisedCopy = ConstraintSerialiser.serialise(copy);
    expect(serialisedCopy).toEqual(serialisedConstraint);
  }

  it('should copy combination constraint', () => {
    const constraint = new CombinationConstraint();
    const studyConstraint = new StudyConstraint();
    const study = new Study();
    study.id = 'STUDY';
    studyConstraint.studies.push(study);
    constraint.addChild(studyConstraint);
    constraint.negated = true;
    testConstraint(constraint);
  });

  it('should copy concept constraint', () => {
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

  it('should copy negation constraint', () => {
    const constraint = new ValueConstraint();
    constraint.negated = true;
    testConstraint(constraint);
  });

  it('should copy pedigree constraint', () => {
    const constraint = new PedigreeConstraint('parent');
    testConstraint(constraint);
  });
  it('should copy study constraint', () => {
    const constraint = new StudyConstraint();
    const studyA = new Study();
    studyA.id = 'A';
    constraint.studies.push(studyA);
    const studyB = new Study();
    studyB.id = 'B';
    constraint.studies.push(studyB);
    testConstraint(constraint);
  });

  it('should copy subject set constraint', () => {
    const constraint = new SubjectSetConstraint();
    testConstraint(constraint);
  });

  it('should copy time constraint', () => {
    const constraint = new TimeConstraint();
    testConstraint(constraint);

  });

  it('should copy trial visit constraint', () => {
    const constraint = new TrialVisitConstraint();
    const trialVisit = new TrialVisit();
    trialVisit.label = 'Week 1';
    constraint.trialVisits.push(trialVisit);
    testConstraint(constraint);
  });

  it('should copy true constraint', () => {
    testConstraint(new TrueConstraint());
  });

  it('should copy value constraint', () => {
    const constraint = new ValueConstraint();
    testConstraint(constraint);
  });

});
