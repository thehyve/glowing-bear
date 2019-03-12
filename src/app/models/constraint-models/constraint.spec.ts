import {Constraint} from './constraint';
import {CombinationConstraint} from './combination-constraint';
import {PedigreeConstraint} from './pedigree-constraint';
import {ConceptConstraint} from './concept-constraint';



describe('Constraint', () => {

  it('should calculate the depth of a constraint', () => {
    let c111 = new Constraint();
    let c11 = new Constraint();
    let c1 = new Constraint();
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
});
