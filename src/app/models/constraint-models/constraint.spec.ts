import {Constraint} from './constraint';
import {CombinationConstraint} from './combination-constraint';
import {PedigreeConstraint} from './pedigree-constraint';
import {ConceptConstraint} from './concept-constraint';
import {ValueConstraint} from './value-constraint';
import {ConstraintSerialiser} from '../../utilities/constraint-utilities/constraint-serialiser';
import {StudyConstraint} from './study-constraint';
import {Study} from './study';
import {Concept} from './concept';
import {TimeConstraint} from './time-constraint';
import {TrialVisitConstraint} from './trial-visit-constraint';
import {SubjectSetConstraint} from './subject-set-constraint';
import {TrialVisit} from './trial-visit';
import {TrueConstraint} from './true-constraint';


describe('Constraint', () => {

  it('should calculate the depth of a constraint', () => {
    let c111 = new ValueConstraint();
    let c11 = new PedigreeConstraint('test');
    let c1 = new CombinationConstraint();
    c111.parentConstraint = c11;
    c11.parentConstraint = c1;

    expect(c111.depth).toBe(2);
    expect(c11.depth).toBe(1);
  });

  it('should find a parent dimension', () => {
    let constraint1 = new CombinationConstraint();
    constraint1.dimension = 'Diagnosis ID';
    let constraint2 = new CombinationConstraint();
    constraint2.dimension = 'Biomaterial ID';
    let constraint3 = new PedigreeConstraint('PAR');
    constraint1.addChild(constraint2);
    constraint2.addChild(constraint3);
    let constraint5 = new ConceptConstraint();
    let constraint4 = new CombinationConstraint();
    constraint4.addChild(constraint5);
    constraint3.rightHandSideConstraint = constraint4;

    expect(constraint1.parentDimension).toBe(null);
    expect(constraint2.parentDimension).toBe('Diagnosis ID');
    expect(constraint3.parentDimension).toBe('Biomaterial ID');
    expect(constraint4.parentDimension).toBe('Biomaterial ID');
    expect(constraint5.parentDimension).toBe('patient');
  });

  function testCloneConstraint(constraint: Constraint) {
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
    testCloneConstraint(constraint);
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
    testCloneConstraint(constraint);

    constraint.applyValDateConstraint = false;
    constraint.applyObsDateConstraint = true;
    constraint.obsDateConstraint = new TimeConstraint();
    constraint.trialVisitConstraint = new TrialVisitConstraint();
    constraint.applyTrialVisitConstraint = true;
    testCloneConstraint(constraint);
  });

  it('should clone negation constraint', () => {
    const constraint = new ValueConstraint();
    constraint.negated = true;
    testCloneConstraint(constraint);
  });

  it('should clone pedigree constraint', () => {
    const constraint = new PedigreeConstraint('parent');
    testCloneConstraint(constraint);
  });
  it('should clone study constraint', () => {
    const constraint = new StudyConstraint();
    const studyA = new Study();
    studyA.id = 'A';
    constraint.studies.push(studyA);
    const studyB = new Study();
    studyB.id = 'B';
    constraint.studies.push(studyB);
    testCloneConstraint(constraint);
  });

  it('should clone subject set constraint', () => {
    const constraint = new SubjectSetConstraint();
    testCloneConstraint(constraint);
  });

  it('should clone time constraint', () => {
    const constraint = new TimeConstraint();
    testCloneConstraint(constraint);

  });

  it('should clone trial visit constraint', () => {
    const constraint = new TrialVisitConstraint();
    const trialVisit = new TrialVisit();
    trialVisit.label = 'Week 1';
    constraint.trialVisits.push(trialVisit);
    testCloneConstraint(constraint);
  });

  it('should clone true constraint', () => {
    testCloneConstraint(new TrueConstraint());
  });

  it('should clone value constraint', () => {
    const constraint = new ValueConstraint();
    testCloneConstraint(constraint);
  });

});
