import {TrueConstraint} from '../../models/constraint-models/true-constraint';
import {StudyConstraint} from '../../models/constraint-models/study-constraint';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {ValueConstraint} from '../../models/constraint-models/value-constraint';
import {NegationConstraint} from '../../models/constraint-models/negation-constraint';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {PedigreeConstraint} from '../../models/constraint-models/pedigree-constraint';
import {SubjectSetConstraint} from '../../models/constraint-models/subject-set-constraint';
import {TrialVisitConstraint} from '../../models/constraint-models/trial-visit-constraint';
import {TimeConstraint} from '../../models/constraint-models/time-constraint';
import {ConstraintBrief} from './constraint-brief';
import {Concept} from '../../models/constraint-models/concept';

describe('ConstraintVisitor', () => {

  it('ConstraintBrief should not fail on any constraint type', () => {
    const conceptConstraint = new ConceptConstraint();
    const concept = new Concept();
    concept.name = 'Concept name';
    conceptConstraint.concept = concept;
    const constraints = [
      new TrueConstraint(),
      new StudyConstraint(),
      conceptConstraint,
      new ValueConstraint(),
      new NegationConstraint(new TrueConstraint()),
      new CombinationConstraint(),
      new PedigreeConstraint('PAR'),
      new SubjectSetConstraint(),
      new TrialVisitConstraint(),
      new TimeConstraint()
    ];

    let visitor = new ConstraintBrief();

    for (let constraint of constraints) {
      expect(visitor.visit(constraint)).toBeDefined(
        `Visitor does not give a result for constraint type: ${constraint.className}`);
    }
  });

});
