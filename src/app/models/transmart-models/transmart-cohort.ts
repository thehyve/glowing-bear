import {CohortSubscriptionFrequency} from '../cohort-models/cohort-subscription-frequency';
import {TransmartConstraint} from './transmart-constraint';

export class TransmartCohort {

  id: string;
  name: string;
  description?: string;
  createDate?: string;
  updateDate?: string;
  apiVersion?: string;
  // Indicate if the set is bookmarked
  bookmarked: boolean;
  // Subject dimension
  subjectDimension?: string;
  // The constraint that defines the cohort
  constraint?: TransmartConstraint;
  // Indicate if the set is subscribed on
  subscribed: boolean;
  // The frequency of the subscription: daily or monthly
  subscriptionFreq?: CohortSubscriptionFrequency;

}
