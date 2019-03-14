import {ConstraintSerialiser} from './constraint-serialiser';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';

describe('ConstraintSerialiser', () => {

  it('should serialise constraints to plain objects', () => {
    expect(ConstraintSerialiser.serialise(new ConceptConstraint())).toBeDefined();
  });

  it('should print constraints to plain JSON', () => {
    expect(ConstraintSerialiser.print(new ConceptConstraint())).toContain('"className": "ConceptConstraint"');
  });

});
