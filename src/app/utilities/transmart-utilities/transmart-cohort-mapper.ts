import {Cohort} from '../../models/cohort-models/cohort';
import {TransmartConstraintMapper} from './transmart-constraint-mapper';
import {TransmartCohort} from '../../models/transmart-models/transmart-cohort';

export class TransmartCohortMapper {

  /**
   * map a cohort to plain object that can be downloaded in json, and later imported as well.
   * @param {Cohort} cohort
   * @returns {TransmartCohort}
   */
  static serialise(cohort: Cohort): TransmartCohort {
      const obj = new TransmartCohort();
      obj.id = cohort.id;
      obj.name = cohort.name;
      obj.bookmarked = cohort.bookmarked;
      obj.subscribed = cohort.subscribed;
      obj.subjectDimension = cohort.type;
      if (cohort.subscribed) {
        obj.subscriptionFreq = cohort.subscriptionFreq;
      }
      if (cohort.description) {
        obj.description = cohort.description;
      }
      if (cohort.createDate) {
        obj.createDate = cohort.createDate;
      }
      if (cohort.updateDate) {
        obj.updateDate = cohort.updateDate;
      }
      if (cohort.constraint) {
        obj.constraint = TransmartConstraintMapper.mapConstraint(cohort.constraint);
      }
      return obj;
  }

  /**
   * Read a cohort from plain object.
   * @param {TransmartCohort} obj
   * @returns {Cohort}
   */
  static deserialise(obj: TransmartCohort): Cohort {
    const cohort = new Cohort(obj.id, obj.name);
    cohort.bookmarked = obj.bookmarked;
    cohort.subscribed = obj.subscribed;
    cohort.subscriptionFreq = obj.subscriptionFreq;
    cohort.description = obj.description;
    cohort.createDate = obj.createDate;
    cohort.updateDate = obj.updateDate;
    cohort.constraint = TransmartConstraintMapper.generateConstraintFromObject(obj.constraint);
    cohort.type = obj.subjectDimension;
    return cohort;
  }

}
