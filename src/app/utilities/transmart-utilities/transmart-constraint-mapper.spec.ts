import {TransmartConstraintMapper} from './transmart-constraint-mapper';

describe('TransmartConstraintMapper', () => {

  it('should map null or undefined to null', () => {
    expect(TransmartConstraintMapper.generateConstraintFromObject(null)).toBeNull();
    expect(TransmartConstraintMapper.generateConstraintFromObject(undefined)).toBeNull();
  });

  it('should throw error when reading null or undefined constraint', () => {
    expect(() => TransmartConstraintMapper.mapConstraint(null)).toThrowError();
    expect(() => TransmartConstraintMapper.mapConstraint(undefined)).toThrowError();
  });

});
