/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {inject, TestBed} from '@angular/core/testing';

import {ResourceService} from './resource.service';
import {Study} from '../models/constraint-models/study';
import {TrueConstraint} from '../models/constraint-models/true-constraint';
import {CountItem} from '../models/aggregate-models/count-item';
import {NumericalAggregate} from '../models/aggregate-models/numerical-aggregate';
import {ConceptConstraint} from '../models/constraint-models/concept-constraint';
import {Concept} from '../models/constraint-models/concept';
import {of as observableOf} from 'rxjs';
import {CategoricalAggregate} from '../models/aggregate-models/categorical-aggregate';
import {Pedigree} from '../models/constraint-models/pedigree';
import {Cohort} from '../models/cohort-models/cohort';
import {AppConfigMock} from '../config/app.config.mock';
import {AppConfig} from '../config/app.config';
import {TransmartResourceService} from './transmart-resource.service';
import {TransmartResourceServiceMock} from './mocks/transmart-resource.service.mock';
import {TransmartPatient} from '../models/transmart-models/transmart-patient';
import {GbBackendHttpService} from './http/gb-backend-http.service';
import {GbBackendHttpServiceMock} from './mocks/gb-backend-http.service.mock';

describe('ResourceService', () => {
  let resourceService: ResourceService;
  let transmartResourceService: TransmartResourceService;
  let gbBackendHttpService: GbBackendHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ResourceService,
        {
          provide: TransmartResourceService,
          useClass: TransmartResourceServiceMock
        },
        {
          provide: GbBackendHttpService,
          useClass: GbBackendHttpServiceMock
        },
        {
          provide: AppConfig,
          useClass: AppConfigMock
        }
      ]
    });
    resourceService = TestBed.get(ResourceService);
    transmartResourceService = TestBed.get(TransmartResourceService);
    gbBackendHttpService = TestBed.get(GbBackendHttpService);
  });

  it('should be injected', inject([ResourceService], (service: ResourceService) => {
    expect(service).toBeTruthy();
  }));

  it('should get studies', () => {
    resourceService.getStudies()
      .subscribe((studies: Study[]) => {
        expect(studies.length).toBe(2);
        expect(studies[0].id).toBe('CATEGORICAL_VALUES');
      });
    resourceService.endpointMode = null;
    resourceService.getStudies()
      .subscribe(res => {
      }, err => {
        expect(err).toBeDefined();
      })
  })

  it('should update cohort selection counts', () => {
    let dummy = new TrueConstraint();
    resourceService.updateCohortSelectionCounts(dummy)
      .then(() => {
        expect(resourceService.cohortSelectionCounts.subjectCount).toEqual(10);
      });
    resourceService.endpointMode = null;
    resourceService.updateCohortSelectionCounts(dummy)
      .catch(err => {
        expect(err).toBeDefined();
      });
  })

  it('should get counts per concept', () => {
    let dummy = new TrueConstraint();
    resourceService.getCountsPerConcept(dummy)
      .subscribe((map: Map<string, CountItem>) => {
        expect(map.size).toBe(2);
        expect(map.has('EHR:VSIGN:HR')).toBe(true);
      })
    resourceService.endpointMode = null;
    resourceService.getCountsPerConcept(dummy)
      .subscribe((map: Map<string, CountItem>) => {
      }, err => {
        expect(err).toBeDefined();
      });
  })

  it('should get counts per study', () => {
    let dummy = new TrueConstraint();
    resourceService.getCountsPerStudy(dummy)
      .subscribe((map: Map<string, CountItem>) => {
        expect(map.size).toBe(2);
      })
    resourceService.endpointMode = null;
    resourceService.getCountsPerStudy(dummy)
      .subscribe((map: Map<string, CountItem>) => {
      }, err => {
        expect(err).toBeDefined();
      });
  })

  it('should get counts per study and concept', () => {
    let dummy = new TrueConstraint();
    resourceService.getCountsPerStudyAndConcept(dummy)
      .subscribe((map: Map<string, Map<string, CountItem>>) => {
        expect(map.size).toBe(1);
        expect(map.get('EHR').size).toBe(2);
      })
    resourceService.endpointMode = null;
    resourceService.getCountsPerStudyAndConcept(dummy)
      .subscribe((map: Map<string, Map<string, CountItem>>) => {
      }, err => {
        expect(err).toBeDefined();
      });
  })

  it('should get counts', () => {
    let dummy = new TrueConstraint();
    resourceService.getCounts(dummy)
      .subscribe((item: CountItem) => {
        expect(item.subjectCount).toBe(23);
        expect(item.observationCount).toBe(46);
      });
    resourceService.endpointMode = null;
    resourceService.getCounts(dummy)
      .subscribe((item: CountItem) => {
      }, err => {
        expect(err).toBeDefined();
      });
  })

  it('should get aggregate', () => {
    let dummy = new ConceptConstraint();
    dummy.concept = new Concept();
    dummy.concept.code = 'CV:DEM:AGE';
    resourceService.getAggregate(dummy)
      .subscribe((res: NumericalAggregate) => {
        expect(res.min).toEqual(20);
        expect(res.max).toEqual(26);
        expect(res.count).toEqual(3);
      });

    let catAgg = {
      'CV:DEM:RACE': {
        categoricalValueAggregates: {
          nullValueCounts: null,
          valueCounts: {
            Caucasian: 2,
            Latino: 1
          }
        }
      }
    };
    spyOn(transmartResourceService, 'getAggregate').and.callFake(() => {
      return observableOf(catAgg);
    });
    dummy.concept.code = 'CV:DEM:RACE';
    resourceService.getAggregate(dummy)
      .subscribe((res: CategoricalAggregate) => {
        expect(res.values.length).toEqual(2);
        expect(res.values.includes('Caucasian')).toBe(true);
        expect(res.values.includes('Latino')).toBe(true);
      });
    resourceService.endpointMode = null;
    resourceService.getAggregate(dummy)
      .subscribe((res) => {
      }, err => {
        expect(err).toBeDefined();
      });
  });

  it('should handle empty aggregate object', () => {
    spyOn(transmartResourceService, 'getAggregate').and.callFake(() => {
      return observableOf({});
    });
    let dummy = new ConceptConstraint();
    dummy.concept = new Concept();
    dummy.concept.code = 'CV:DEM:AGE';
    resourceService.getAggregate(dummy)
      .subscribe(res => {
        expect(res).toBeNull();
      })
  });

  it('should get pedigrees', () => {
    resourceService.getPedigrees()
      .subscribe((pedigrees: Pedigree[]) => {
        expect(pedigrees.length).toBe(2);
        expect(pedigrees[0].label).toBe('PAR');
        expect(pedigrees[1].label).toBe('DZ');
      });
    resourceService.endpointMode = null;
    resourceService.getPedigrees()
      .subscribe(res => {
      }, err => {
        expect(err).toBeDefined();
      });
  });

  it('should get cohorts', () => {
    const getQueriesSpy = spyOn(gbBackendHttpService, 'getQueries').and.callThrough();
    resourceService.getCohorts()
      .subscribe((res: Cohort[]) => {
        expect(res.length).toBe(2);
        expect(res[0].constraint.className).toBe('TrueConstraint');
        expect(res[1].constraint.className).toBe('CombinationConstraint');
      });
    resourceService.endpointMode = null;
    resourceService.getCohorts()
      .subscribe(res => {
      }, err => {
        expect(err).toBeDefined();
      });
    expect(getQueriesSpy).toHaveBeenCalled();
  });

  it('should get subjects', () => {
    resourceService.getSubjects(null)
      .subscribe((res: TransmartPatient[]) => {
        expect(res.length).toBe(1);
        expect(res[0].id).toBe(100);
      });
    resourceService.endpointMode = null;
    resourceService.getCohorts()
      .subscribe(res => {
      }, err => {
        expect(err).toBeDefined();
      });
  });

});
