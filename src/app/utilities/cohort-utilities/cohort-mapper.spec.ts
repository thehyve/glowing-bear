import {Cohort} from '../../models/cohort-models/cohort';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {CombinationState} from '../../models/constraint-models/combination-state';
import {TrueConstraint} from '../../models/constraint-models/true-constraint';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {Concept} from '../../models/constraint-models/concept';
import {CohortSubscriptionFrequency} from '../../models/cohort-models/cohort-subscription-frequency';
import {TransmartSubSelectionConstraint} from '../../models/transmart-models/transmart-constraint';
import {CohortMapper} from './cohort-mapper';
import {CohortRepresentation} from '../../models/gb-backend-models/cohort-representation';

describe('CohortMapper', () => {

  function createCombinationConstraint(): CombinationConstraint {
    const sampleConstraint = new CombinationConstraint();
    sampleConstraint.combinationState = CombinationState.And;
    sampleConstraint.dimension = 'sample';
    const conceptConstraint = new ConceptConstraint();
    const concept = new Concept();
    concept.code = 'xyz';
    concept.fullName = '\\test\\xyz\\';
    conceptConstraint.concept = concept;
    sampleConstraint.addChild(conceptConstraint);
    sampleConstraint.addChild(new TrueConstraint());
    const constraint = new CombinationConstraint();
    constraint.combinationState = CombinationState.Or;
    constraint.addChild(sampleConstraint);
    return constraint;
  }

  it('should correctly serialise cohorts', () => {
    const cohort = new Cohort(null, 'test');
    cohort.constraint = createCombinationConstraint();
    cohort.type = 'patient';
    const cohortObject = CohortMapper.serialise(cohort);
    const expectedObject: CohortRepresentation = {
      id: null,
      name: 'test',
      subjectDimension: 'patient',
      queryConstraint: {
        type: 'subselection',
        dimension: 'sample',
        constraint: {
          type: 'concept',
          conceptCode: 'xyz'
        }
      } as TransmartSubSelectionConstraint,
      queryBlob: {
        queryConstraintFull: {
          type: 'subselection',
          dimension: 'sample',
          constraint: {
            type: 'concept',
            conceptCode: 'xyz',
            fullName: '\\test\\xyz\\'
          }
        } as TransmartSubSelectionConstraint,
      },
      bookmarked: false,
      subscribed: false
    };
    expect(JSON.parse(JSON.stringify(cohortObject))).toEqual(JSON.parse(JSON.stringify(expectedObject)));
    const result = CohortMapper.deserialise(cohortObject);
    const resultObject = CohortMapper.serialise(result);
    expect(resultObject).toEqual(cohortObject);
  });

  it('should correctly serialise cohorts with subscription', () => {
    const cohort = new Cohort(null, 'test');
    cohort.constraint = createCombinationConstraint();
    cohort.type = 'patient';
    cohort.subscribed = true;
    cohort.subscriptionFreq = CohortSubscriptionFrequency.WEEKLY;
    const cohortObject = CohortMapper.serialise(cohort);
    expect(cohortObject.subscribed).toBeTruthy();
    expect(cohortObject.subscriptionFreq).toEqual(CohortSubscriptionFrequency.WEEKLY);
    const result = CohortMapper.deserialise(cohortObject);
    const resultObject = CohortMapper.serialise(result);
    expect(resultObject).toEqual(cohortObject);
  });

  it('should correctly serialise cohorts with bookmark', () => {
    const cohort = new Cohort(null, 'test');
    cohort.constraint = createCombinationConstraint();
    cohort.type = 'patient';
    cohort.bookmarked = true;
    const cohortObject = CohortMapper.serialise(cohort);
    expect(cohortObject.bookmarked).toBeTruthy();
    const result = CohortMapper.deserialise(cohortObject);
    const resultObject = CohortMapper.serialise(result);
    expect(resultObject).toEqual(cohortObject);
  });

});
