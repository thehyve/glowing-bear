/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
import {Concept} from '../../models/constraint-models/concept';
import {TransmartConstraintSerialiser} from '../transmart-utilities/transmart-constraint-serialiser';

describe('ConstraintVisitor', () => {

  it('TransmartConstraintSerialiser should not fail on any constraint type', () => {
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

    let visitor = new TransmartConstraintSerialiser(false);

    for (let constraint of constraints) {
      expect(visitor.visit(constraint)).toBeDefined(
        `Visitor does not give a result for constraint type: ${constraint.className}`);
    }
  });

  it('TransmartConstraintSerialiser should include negation', () => {
    const studyConstraint = new StudyConstraint();
    studyConstraint.negated = true;
    let visitor = new TransmartConstraintSerialiser(false);

    let spy1 = spyOn(visitor, 'visitNegationConstraint').and.callThrough();
    let spy2 = spyOn(visitor, 'visitStudyConstraint').and.callThrough();

    expect(visitor.visit(studyConstraint)).toBeDefined(
      `Visitor does not give a result for constraint type: ${studyConstraint.className}`);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  });

});
