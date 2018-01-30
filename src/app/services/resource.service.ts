import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptions, ResponseContentType} from '@angular/http';
import 'rxjs/add/operator/toPromise';

import {Observable} from 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import {Study} from '../models/study';
import {EndpointService} from './endpoint.service';
import {Constraint} from '../models/constraints/constraint';
import {TrialVisit} from '../models/trial-visit';
import {ExportJob} from '../models/export-job';
import {Query} from '../models/query';
import {PatientSetResponse} from '../models/patient-set-response';
import {PedigreeRelationTypeResponse} from '../models/pedigree-relation-type-response';

@Injectable()
export class ResourceService {

  constructor(private http: Http, private endpointService: EndpointService) {
  }

  /**
   * Currently only handles the 'invalid_token' error, other errors are passed on.
   * @param error
   * @returns {any}
   */
  private handleError(error: Response | any) {
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;

      if (err === 'invalid_token') {
        this.endpointService.invalidateToken();
      }

    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg || 'Server error');
  }

  /**
   * Make a post http request
   * @param urlPart - the part used in baseUrl/urlPart
   * @param body
   * @param responseField
   * @returns {any}
   */
  private postCall(urlPart, body, responseField) {
    const endpoint = this.endpointService.getEndpoint();
    if (endpoint) {
      let headers = new Headers();
      headers.append('Authorization', `Bearer ${endpoint.accessToken}`);
      headers.append('Content-Type', 'application/json');
      const options = new RequestOptions({headers: headers});
      const url = `${endpoint.getUrl()}/${urlPart}`;
      if (responseField) {
        return this.http.post(url, body, options)
          .map((res: Response) => res.json()[responseField])
          .catch(this.handleError.bind(this));
      } else {
        return this.http.post(url, body, options)
          .map((res: Response) => res.json())
          .catch(this.handleError.bind(this));
      }
    } else {
      this.handleError({message: 'Could not establish endpoint.'});
    }
  }

  /**
   * Make a get http request
   * @param urlPart - the part used in baseUrl/urlPart
   * @param responseField
   * @returns {Observable<any | any>}
   */
  private getCall(urlPart, responseField) {
    const endpoint = this.endpointService.getEndpoint();
    if (endpoint) {
      let headers = new Headers();
      headers.append('Authorization', `Bearer ${endpoint.accessToken}`);
      headers.append('Content-Type', 'application/json');
      const options = new RequestOptions({headers: headers});
      const url = `${endpoint.getUrl()}/${urlPart}`;
      if (responseField) {
        return this.http.get(url, options)
          .map((response: Response) => response.json()[responseField])
          .catch(this.handleError.bind(this));
      } else {
        return this.http.get(url, options)
          .map((response: Response) => response.json())
          .catch(this.handleError.bind(this));
      }

    } else {
      this.handleError({message: 'Could not establish endpoint.'});
    }
  }

  /**
   * Make a put http request
   * @param urlPart
   * @param body
   * @returns {Observable<any | any>}
   */
  private putCall(urlPart, body) {
    const endpoint = this.endpointService.getEndpoint();
    if (endpoint) {
      let headers = new Headers();
      headers.append('Authorization', `Bearer ${endpoint.accessToken}`);
      headers.append('Content-Type', 'application/json');
      let options = new RequestOptions({headers: headers});
      let url = `${endpoint.getUrl()}/${urlPart}`;
      return this.http.put(url, body, options)
        .catch(this.handleError.bind(this));
    } else {
      this.handleError({message: 'Could not establish endpoint.'});
    }
  }

  /**
   * Make a delete http request
   * @param urlPart
   * @returns {Observable<any | any>}
   */
  private deleteCall(urlPart) {
    const endpoint = this.endpointService.getEndpoint();
    if (endpoint) {
      let headers = new Headers();
      headers.append('Authorization', `Bearer ${endpoint.accessToken}`);
      headers.append('Content-Type', 'application/json');
      let options = new RequestOptions({headers: headers});
      let url = `${endpoint.getUrl()}/${urlPart}`;
      return this.http.delete(url, options)
        .catch(this.handleError.bind(this));
    } else {
      this.handleError({message: 'Could not establish endpoint.'});
    }
  }

  // -------------------------------------- tree node calls --------------------------------------
  /**
   * Returns the available studies.
   * @returns {Observable<Study[]>}
   */
  getStudies(): Observable<Study[]> {
    const urlPart = 'studies';
    const responseField = 'studies';
    let studiesString = '[\n' +
      '        {\n' +
      '            "id": -20,\n' +
      '            "studyId": "CATEGORICAL_VALUES",\n' +
      '            "bioExperimentId": -10,\n' +
      '            "dimensions": [\n' +
      '                "concept",\n' +
      '                "patient",\n' +
      '                "study"\n' +
      '            ]\n' +
      '        },\n' +
      '        {\n' +
      '            "id": -21,\n' +
      '            "studyId": "CLINICAL_TRIAL",\n' +
      '            "bioExperimentId": -11,\n' +
      '            "dimensions": [\n' +
      '                "concept",\n' +
      '                "patient",\n' +
      '                "study",\n' +
      '                "trial visit"\n' +
      '            ]\n' +
      '        },\n' +
      '        {\n' +
      '            "id": -30,\n' +
      '            "studyId": "CLINICAL_TRIAL_HIGHDIM",\n' +
      '            "bioExperimentId": -20,\n' +
      '            "dimensions": [\n' +
      '                "concept",\n' +
      '                "patient",\n' +
      '                "study",\n' +
      '                "trial visit",\n' +
      '                "biomarker",\n' +
      '                "projection",\n' +
      '                "assay"\n' +
      '            ]\n' +
      '        },\n' +
      '        {\n' +
      '            "id": -22,\n' +
      '            "studyId": "EHR",\n' +
      '            "bioExperimentId": -12,\n' +
      '            "dimensions": [\n' +
      '                "visit",\n' +
      '                "concept",\n' +
      '                "patient",\n' +
      '                "study",\n' +
      '                "start time",\n' +
      '                "end time"\n' +
      '            ]\n' +
      '        },\n' +
      '        {\n' +
      '            "id": -31,\n' +
      '            "studyId": "EHR_HIGHDIM",\n' +
      '            "bioExperimentId": -21,\n' +
      '            "dimensions": [\n' +
      '                "visit",\n' +
      '                "concept",\n' +
      '                "patient",\n' +
      '                "study",\n' +
      '                "biomarker",\n' +
      '                "projection",\n' +
      '                "start time",\n' +
      '                "end time",\n' +
      '                "assay"\n' +
      '            ]\n' +
      '        },\n' +
      '        {\n' +
      '            "id": -44,\n' +
      '            "studyId": "MIX_HD",\n' +
      '            "bioExperimentId": -24,\n' +
      '            "dimensions": []\n' +
      '        },\n' +
      '        {\n' +
      '            "id": -45,\n' +
      '            "studyId": "ORACLE_1000_PATIENT",\n' +
      '            "bioExperimentId": -28,\n' +
      '            "dimensions": [\n' +
      '                "concept",\n' +
      '                "patient",\n' +
      '                "study"\n' +
      '            ]\n' +
      '        },\n' +
      '        {\n' +
      '            "id": -32,\n' +
      '            "studyId": "RNASEQ_TRANSCRIPT",\n' +
      '            "bioExperimentId": -22,\n' +
      '            "dimensions": []\n' +
      '        },\n' +
      '        {\n' +
      '            "id": -27,\n' +
      '            "studyId": "SHARED_CONCEPTS_STUDY_A",\n' +
      '            "bioExperimentId": -17,\n' +
      '            "dimensions": [\n' +
      '                "concept",\n' +
      '                "patient",\n' +
      '                "study"\n' +
      '            ]\n' +
      '        },\n' +
      '        {\n' +
      '            "id": -28,\n' +
      '            "studyId": "SHARED_CONCEPTS_STUDY_B",\n' +
      '            "bioExperimentId": -18,\n' +
      '            "dimensions": [\n' +
      '                "concept",\n' +
      '                "patient",\n' +
      '                "study"\n' +
      '            ]\n' +
      '        },\n' +
      '        {\n' +
      '            "id": -29,\n' +
      '            "studyId": "SHARED_CONCEPTS_STUDY_C_PRIV",\n' +
      '            "bioExperimentId": -19,\n' +
      '            "dimensions": [\n' +
      '                "concept",\n' +
      '                "patient",\n' +
      '                "study"\n' +
      '            ]\n' +
      '        },\n' +
      '        {\n' +
      '            "id": -14,\n' +
      '            "studyId": "SHARED_HD_CONCEPTS_STUDY_A",\n' +
      '            "bioExperimentId": -25,\n' +
      '            "dimensions": []\n' +
      '        },\n' +
      '        {\n' +
      '            "id": -15,\n' +
      '            "studyId": "SHARED_HD_CONCEPTS_STUDY_B",\n' +
      '            "bioExperimentId": -26,\n' +
      '            "dimensions": []\n' +
      '        },\n' +
      '        {\n' +
      '            "id": -16,\n' +
      '            "studyId": "SHARED_HD_CONCEPTS_STUDY_C_PR",\n' +
      '            "bioExperimentId": -27,\n' +
      '            "dimensions": []\n' +
      '        },\n' +
      '        {\n' +
      '            "id": -50,\n' +
      '            "studyId": "SURVEY1",\n' +
      '            "bioExperimentId": null,\n' +
      '            "dimensions": [\n' +
      '                "concept",\n' +
      '                "patient",\n' +
      '                "study",\n' +
      '                "start time",\n' +
      '                "missing_value"\n' +
      '            ],\n' +
      '            "metadata": {\n' +
      '                "conceptCodeToVariableMetadata": {\n' +
      '                    "birthdate": {\n' +
      '                        "columns": 22,\n' +
      '                        "decimals": null,\n' +
      '                        "description": "Birth Date",\n' +
      '                        "measure": "SCALE",\n' +
      '                        "missingValues": null,\n' +
      '                        "name": "birthdate1",\n' +
      '                        "type": "DATE",\n' +
      '                        "valueLabels": {},\n' +
      '                        "width": 22\n' +
      '                    },\n' +
      '                    "favouritebook": {\n' +
      '                        "columns": 400,\n' +
      '                        "decimals": null,\n' +
      '                        "description": "Favourite Book",\n' +
      '                        "measure": "NOMINAL",\n' +
      '                        "missingValues": null,\n' +
      '                        "name": "favouritebook",\n' +
      '                        "type": "STRING",\n' +
      '                        "valueLabels": {},\n' +
      '                        "width": 400\n' +
      '                    },\n' +
      '                    "gender": {\n' +
      '                        "columns": 14,\n' +
      '                        "decimals": null,\n' +
      '                        "description": "Gender",\n' +
      '                        "measure": "NOMINAL",\n' +
      '                        "missingValues": {\n' +
      '                            "lower": null,\n' +
      '                            "upper": null,\n' +
      '                            "values": [\n' +
      '                                -2\n' +
      '                            ]\n' +
      '                        },\n' +
      '                        "name": "gender1",\n' +
      '                        "type": "NUMERIC",\n' +
      '                        "valueLabels": {\n' +
      '                            "1": "Female",\n' +
      '                            "2": "Male",\n' +
      '                            "-2": "Not Specified"\n' +
      '                        },\n' +
      '                        "width": 12\n' +
      '                    }\n' +
      '                }\n' +
      '            }\n' +
      '        },\n' +
      '        {\n' +
      '            "id": -51,\n' +
      '            "studyId": "SURVEY2",\n' +
      '            "bioExperimentId": null,\n' +
      '            "dimensions": [\n' +
      '                "concept",\n' +
      '                "patient",\n' +
      '                "study",\n' +
      '                "start time",\n' +
      '                "missing_value"\n' +
      '            ],\n' +
      '            "metadata": {\n' +
      '                "conceptCodeToVariableMetadata": {\n' +
      '                    "description": {\n' +
      '                        "columns": 210,\n' +
      '                        "decimals": null,\n' +
      '                        "description": "Description",\n' +
      '                        "measure": "NOMINAL",\n' +
      '                        "missingValues": null,\n' +
      '                        "name": "description",\n' +
      '                        "type": "STRING",\n' +
      '                        "valueLabels": {},\n' +
      '                        "width": 200\n' +
      '                    },\n' +
      '                    "height": {\n' +
      '                        "columns": 15,\n' +
      '                        "decimals": 2,\n' +
      '                        "description": "Height",\n' +
      '                        "measure": "SCALE",\n' +
      '                        "missingValues": {\n' +
      '                            "lower": null,\n' +
      '                            "upper": null,\n' +
      '                            "values": [\n' +
      '                                -1\n' +
      '                            ]\n' +
      '                        },\n' +
      '                        "name": "height1",\n' +
      '                        "type": "NUMERIC",\n' +
      '                        "valueLabels": {\n' +
      '                            "-1": "Asked, but not answered"\n' +
      '                        },\n' +
      '                        "width": 14\n' +
      '                    }\n' +
      '                }\n' +
      '            }\n' +
      '        },\n' +
      '        {\n' +
      '            "id": -23,\n' +
      '            "studyId": "TUMOR_NORMAL_SAMPLES",\n' +
      '            "bioExperimentId": -13,\n' +
      '            "dimensions": [\n' +
      '                "concept",\n' +
      '                "patient",\n' +
      '                "study",\n' +
      '                "biomarker",\n' +
      '                "projection",\n' +
      '                "sample_type",\n' +
      '                "assay"\n' +
      '            ]\n' +
      '        },\n' +
      '        {\n' +
      '            "id": 1,\n' +
      '            "studyId": "ANTR_9",\n' +
      '            "bioExperimentId": null,\n' +
      '            "dimensions": [\n' +
      '                "concept",\n' +
      '                "patient",\n' +
      '                "study",\n' +
      '                "missing_value"\n' +
      '            ],\n' +
      '            "metadata": {\n' +
      '                "conceptCodeToVariableMetadata": {\n' +
      '                    "age": {\n' +
      '                        "columns": 2,\n' +
      '                        "decimals": null,\n' +
      '                        "description": "age",\n' +
      '                        "measure": "SCALE",\n' +
      '                        "missingValues": {\n' +
      '                            "lower": null,\n' +
      '                            "upper": null,\n' +
      '                            "values": []\n' +
      '                        },\n' +
      '                        "name": "age9",\n' +
      '                        "type": "NUMERIC",\n' +
      '                        "valueLabels": {},\n' +
      '                        "width": 8\n' +
      '                    },\n' +
      '                    "gebpl9": {\n' +
      '                        "columns": null,\n' +
      '                        "decimals": null,\n' +
      '                        "description": "place of birth",\n' +
      '                        "measure": "NOMINAL",\n' +
      '                        "missingValues": {\n' +
      '                            "lower": null,\n' +
      '                            "upper": null,\n' +
      '                            "values": []\n' +
      '                        },\n' +
      '                        "name": "gebpl9",\n' +
      '                        "type": "STRING",\n' +
      '                        "valueLabels": {},\n' +
      '                        "width": 120\n' +
      '                    },\n' +
      '                    "gwcht9": {\n' +
      '                        "columns": null,\n' +
      '                        "decimals": null,\n' +
      '                        "description": "weight (kg)",\n' +
      '                        "measure": "SCALE",\n' +
      '                        "missingValues": {\n' +
      '                            "lower": -3,\n' +
      '                            "upper": -1,\n' +
      '                            "values": []\n' +
      '                        },\n' +
      '                        "name": "gwcht9",\n' +
      '                        "type": "NUMERIC",\n' +
      '                        "valueLabels": {},\n' +
      '                        "width": 3\n' +
      '                    },\n' +
      '                    "gznd9": {\n' +
      '                        "columns": null,\n' +
      '                        "decimals": null,\n' +
      '                        "description": "health",\n' +
      '                        "measure": "NOMINAL",\n' +
      '                        "missingValues": {\n' +
      '                            "lower": -3,\n' +
      '                            "upper": -1,\n' +
      '                            "values": []\n' +
      '                        },\n' +
      '                        "name": "gznd9",\n' +
      '                        "type": "NUMERIC",\n' +
      '                        "valueLabels": {\n' +
      '                            "1.0": "poor",\n' +
      '                            "2.0": "fair",\n' +
      '                            "3.0": "reasonable",\n' +
      '                            "4.0": "good",\n' +
      '                            "5.0": "excellent"\n' +
      '                        },\n' +
      '                        "width": 8\n' +
      '                    },\n' +
      '                    "ingvld9": {\n' +
      '                        "columns": 2,\n' +
      '                        "decimals": null,\n' +
      '                        "description": "Completed via Internet or paper (and which version)",\n' +
      '                        "measure": "NOMINAL",\n' +
      '                        "missingValues": {\n' +
      '                            "lower": null,\n' +
      '                            "upper": null,\n' +
      '                            "values": []\n' +
      '                        },\n' +
      '                        "name": "ingvld9",\n' +
      '                        "type": "NUMERIC",\n' +
      '                        "valueLabels": {\n' +
      '                            "1.0": "completed online",\n' +
      '                            "2.0": "completed on paper"\n' +
      '                        },\n' +
      '                        "width": 8\n' +
      '                    },\n' +
      '                    "invd9": {\n' +
      '                        "columns": null,\n' +
      '                        "decimals": null,\n' +
      '                        "description": "date of completion",\n' +
      '                        "measure": "SCALE",\n' +
      '                        "missingValues": {\n' +
      '                            "lower": null,\n' +
      '                            "upper": null,\n' +
      '                            "values": []\n' +
      '                        },\n' +
      '                        "name": "invd9",\n' +
      '                        "type": "DATE",\n' +
      '                        "valueLabels": {},\n' +
      '                        "width": 11\n' +
      '                    },\n' +
      '                    "lengt9": {\n' +
      '                        "columns": null,\n' +
      '                        "decimals": null,\n' +
      '                        "description": "height (cm)",\n' +
      '                        "measure": "SCALE",\n' +
      '                        "missingValues": {\n' +
      '                            "lower": -3,\n' +
      '                            "upper": -1,\n' +
      '                            "values": []\n' +
      '                        },\n' +
      '                        "name": "lengt9",\n' +
      '                        "type": "NUMERIC",\n' +
      '                        "valueLabels": {},\n' +
      '                        "width": 3\n' +
      '                    },\n' +
      '                    "lijst9": {\n' +
      '                        "columns": 2,\n' +
      '                        "decimals": null,\n' +
      '                        "description": "Survey 9 completed",\n' +
      '                        "measure": "NOMINAL",\n' +
      '                        "missingValues": {\n' +
      '                            "lower": null,\n' +
      '                            "upper": null,\n' +
      '                            "values": []\n' +
      '                        },\n' +
      '                        "name": "lijst9",\n' +
      '                        "type": "NUMERIC",\n' +
      '                        "valueLabels": {\n' +
      '                            "0.0": "no",\n' +
      '                            "1.0": "yes"\n' +
      '                        },\n' +
      '                        "width": 8\n' +
      '                    },\n' +
      '                    "roken9": {\n' +
      '                        "columns": null,\n' +
      '                        "decimals": null,\n' +
      '                        "description": "smoking",\n' +
      '                        "measure": "NOMINAL",\n' +
      '                        "missingValues": {\n' +
      '                            "lower": -3,\n' +
      '                            "upper": -1,\n' +
      '                            "values": []\n' +
      '                        },\n' +
      '                        "name": "roken9",\n' +
      '                        "type": "NUMERIC",\n' +
      '                        "valueLabels": {\n' +
      '                            "1.0": "Yes, more than 10 cigarettes a day",\n' +
      '                            "2.0": "Yes, less than 10 cigarettes a day",\n' +
      '                            "3.0": "Yes, but not cigarettes",\n' +
      '                            "4.0": "No, I used to but I do not anymore",\n' +
      '                            "5.0": "No I have never smoked"\n' +
      '                        },\n' +
      '                        "width": 8\n' +
      '                    },\n' +
      '                    "sex": {\n' +
      '                        "columns": null,\n' +
      '                        "decimals": null,\n' +
      '                        "description": "sex",\n' +
      '                        "measure": "NOMINAL",\n' +
      '                        "missingValues": {\n' +
      '                            "lower": null,\n' +
      '                            "upper": null,\n' +
      '                            "values": []\n' +
      '                        },\n' +
      '                        "name": "sekse9",\n' +
      '                        "type": "NUMERIC",\n' +
      '                        "valueLabels": {\n' +
      '                            "1.0": "male",\n' +
      '                            "2.0": "female"\n' +
      '                        },\n' +
      '                        "width": 2\n' +
      '                    },\n' +
      '                    "shoe9": {\n' +
      '                        "columns": 2,\n' +
      '                        "decimals": null,\n' +
      '                        "description": "shoe size",\n' +
      '                        "measure": "NOMINAL",\n' +
      '                        "missingValues": {\n' +
      '                            "lower": null,\n' +
      '                            "upper": null,\n' +
      '                            "values": [\n' +
      '                                -1,\n' +
      '                                -3\n' +
      '                            ]\n' +
      '                        },\n' +
      '                        "name": "shoe9",\n' +
      '                        "type": "NUMERIC",\n' +
      '                        "valueLabels": {},\n' +
      '                        "width": 8\n' +
      '                    },\n' +
      '                    "spajr9": {\n' +
      '                        "columns": 2,\n' +
      '                        "decimals": null,\n' +
      '                        "description": "number of years sport 1, recoded from string to numeric",\n' +
      '                        "measure": "SCALE",\n' +
      '                        "missingValues": {\n' +
      '                            "lower": -9,\n' +
      '                            "upper": -1,\n' +
      '                            "values": []\n' +
      '                        },\n' +
      '                        "name": "spajr9",\n' +
      '                        "type": "NUMERIC",\n' +
      '                        "valueLabels": {\n' +
      '                            "-1.0": "missing",\n' +
      '                            "-2.0": "double answer (paper)",\n' +
      '                            "-3.0": "unclear answer (paper)",\n' +
      '                            "-4.0": "could not be converted to number, see corresponding string variable",\n' +
      '                            "-8.0": "question not asked (online)",\n' +
      '                            "-9.0": "question asked, but not answered (online)"\n' +
      '                        },\n' +
      '                        "width": 4\n' +
      '                    },\n' +
      '                    "spake9": {\n' +
      '                        "columns": 2,\n' +
      '                        "decimals": null,\n' +
      '                        "description": "number of times per week sport 1, recoded from string to numeric",\n' +
      '                        "measure": "SCALE",\n' +
      '                        "missingValues": {\n' +
      '                            "lower": -9,\n' +
      '                            "upper": -1,\n' +
      '                            "values": []\n' +
      '                        },\n' +
      '                        "name": "spake9",\n' +
      '                        "type": "NUMERIC",\n' +
      '                        "valueLabels": {\n' +
      '                            "-1.0": "missing",\n' +
      '                            "-2.0": "double answer (paper)",\n' +
      '                            "-3.0": "unclear answer (paper)",\n' +
      '                            "-4.0": "could not be converted to number, see corresponding string variable",\n' +
      '                            "-8.0": "question not asked (online)",\n' +
      '                            "-9.0": "question asked, but not answered (online)"\n' +
      '                        },\n' +
      '                        "width": 4\n' +
      '                    },\n' +
      '                    "sprta9": {\n' +
      '                        "columns": null,\n' +
      '                        "decimals": null,\n' +
      '                        "description": "name sport 1",\n' +
      '                        "measure": "NOMINAL",\n' +
      '                        "missingValues": {\n' +
      '                            "lower": null,\n' +
      '                            "upper": null,\n' +
      '                            "values": []\n' +
      '                        },\n' +
      '                        "name": "sprta9",\n' +
      '                        "type": "STRING",\n' +
      '                        "valueLabels": {},\n' +
      '                        "width": 765\n' +
      '                    },\n' +
      '                    "tnd1_9": {\n' +
      '                        "columns": null,\n' +
      '                        "decimals": null,\n' +
      '                        "description": "Teeth and dental care item 1, Do you still have one or more of your own teeth or molars?",\n' +
      '                        "measure": "NOMINAL",\n' +
      '                        "missingValues": {\n' +
      '                            "lower": -3,\n' +
      '                            "upper": -1,\n' +
      '                            "values": []\n' +
      '                        },\n' +
      '                        "name": "tnd1_9",\n' +
      '                        "type": "NUMERIC",\n' +
      '                        "valueLabels": {\n' +
      '                            "0.0": "yes",\n' +
      '                            "1.0": "no"\n' +
      '                        },\n' +
      '                        "width": 8\n' +
      '                    },\n' +
      '                    "tnd2_9": {\n' +
      '                        "columns": null,\n' +
      '                        "decimals": null,\n' +
      '                        "description": "Teeth and dental care item 2, How would you rate the state of your teeth?",\n' +
      '                        "measure": "NOMINAL",\n' +
      '                        "missingValues": {\n' +
      '                            "lower": -3,\n' +
      '                            "upper": -1,\n' +
      '                            "values": []\n' +
      '                        },\n' +
      '                        "name": "tnd2_9",\n' +
      '                        "type": "NUMERIC",\n' +
      '                        "valueLabels": {\n' +
      '                            "0.0": "Many untreated cavities",\n' +
      '                            "1.0": "A few untreated cavities",\n' +
      '                            "2.0": "No untreated cavities/no cavities"\n' +
      '                        },\n' +
      '                        "width": 8\n' +
      '                    },\n' +
      '                    "tnd3_9": {\n' +
      '                        "columns": null,\n' +
      '                        "decimals": null,\n' +
      '                        "description": "Teeth and dental care item 3, state of gyms",\n' +
      '                        "measure": "NOMINAL",\n' +
      '                        "missingValues": {\n' +
      '                            "lower": -3,\n' +
      '                            "upper": -1,\n' +
      '                            "values": []\n' +
      '                        },\n' +
      '                        "name": "tnd3_9",\n' +
      '                        "type": "NUMERIC",\n' +
      '                        "valueLabels": {\n' +
      '                            "0.0": "My gums never bleed",\n' +
      '                            "1.0": "My gums bleed occasionally or often",\n' +
      '                            "2.0": "My gums used to bleed, but they do not anymore"\n' +
      '                        },\n' +
      '                        "width": 8\n' +
      '                    },\n' +
      '                    "tnd4_9": {\n' +
      '                        "columns": null,\n' +
      '                        "decimals": null,\n' +
      '                        "description": "Teeth and dental care item 4, Are you currently being treated for gum problems by a parodontologist or dental hygienist?",\n' +
      '                        "measure": "NOMINAL",\n' +
      '                        "missingValues": {\n' +
      '                            "lower": -3,\n' +
      '                            "upper": -1,\n' +
      '                            "values": []\n' +
      '                        },\n' +
      '                        "name": "tnd4_9",\n' +
      '                        "type": "NUMERIC",\n' +
      '                        "valueLabels": {\n' +
      '                            "0.0": "yes",\n' +
      '                            "1.0": "no"\n' +
      '                        },\n' +
      '                        "width": 8\n' +
      '                    },\n' +
      '                    "version9": {\n' +
      '                        "columns": 2,\n' +
      '                        "decimals": null,\n' +
      '                        "description": "version",\n' +
      '                        "measure": "SCALE",\n' +
      '                        "missingValues": {\n' +
      '                            "lower": null,\n' +
      '                            "upper": null,\n' +
      '                            "values": []\n' +
      '                        },\n' +
      '                        "name": "version9",\n' +
      '                        "type": "NUMERIC",\n' +
      '                        "valueLabels": {\n' +
      '                            "1.0": "paper v2.0 (pilot)",\n' +
      '                            "2.0": "paper v2.1/2.2",\n' +
      '                            "3.0": "paper v3.0/3.1 (main version)",\n' +
      '                            "4.0": "online v2.0 (pilot)",\n' +
      '                            "5.0": "online v2.1",\n' +
      '                            "6.0": "online v3.0 (main version)"\n' +
      '                        },\n' +
      '                        "width": 8\n' +
      '                    }\n' +
      '                }\n' +
      '            }\n' +
      '        }\n' +
      '    ]';
    let studies = JSON.parse(studiesString);
    return Observable.of(studies);
    // return this.getCall(urlPart, responseField);
  }

  /**
   * Get a specific branch of the tree nodes
   * @param {string} root - the path to the specific tree node
   * @param {number} depth - the depth of the tree we want to access
   * @param {boolean} hasCounts - whether we want to include patient and observation counts in the tree nodes
   * @param {boolean} hasTags - whether we want to include metadata in the tree nodes
   * @returns {Observable<Object>}
   */
  getTreeNodes(root: string, depth: number, hasCounts: boolean, hasTags: boolean): Observable<object> {
    let urlPart = `tree_nodes?root=${root}&depth=${depth}`;
    if (hasCounts) {
      urlPart += '&counts=true';
    }
    if (hasTags) {
      urlPart += '&tags=true';
    }
    const responseField = 'tree_nodes';
    return this.getCall(urlPart, responseField);
  }

  // -------------------------------------- observations calls --------------------------------------
  /**
   * Given a constraint, get the patient counts and observation counts
   * organized per study, then per concept
   * @param {Constraint} constraint
   * @returns {Observable<Object>}
   */
  getCountsPerStudyAndConcept(constraint: Constraint): Observable<object> {
    const urlPart = 'observations/counts_per_study_and_concept';
    const body = {constraint: constraint.toQueryObject()};
    const responseField = 'countsPerStudy';
    return this.postCall(urlPart, body, responseField);
  }

  /**
   * Give a constraint, get the patient counts and observation counts
   * organized per study
   * @param {Constraint} constraint
   * @returns {Observable<Object>}
   */
  getCountsPerStudy(constraint: Constraint): Observable<object> {
    const urlPart = 'observations/counts_per_study';
    const body = {constraint: constraint.toQueryObject()};
    const responseField = 'countsPerStudy';
    return this.postCall(urlPart, body, responseField);
  }

  // -------------------------------------- observation calls --------------------------------------
  /**
   * Give a constraint, get the corresponding patient count and observation count.
   * @param {Constraint} constraint
   * @returns {Observable<Object>}
   */
  getCounts(constraint: Constraint): Observable<object> {
    const urlPart = 'observations/counts';
    const body = {constraint: constraint.toQueryObject()};
    const responseField = false;
    return this.postCall(urlPart, body, responseField);
  }

  // -------------------------------------- aggregate calls --------------------------------------
  /**
   * Get the aggregate based on the given constraint and aggregate options,
   * the options can be {min, max, count, values, average}
   * @param {Constraint} constraint
   * @returns {Observable<object>}
   */
  getAggregate(constraint: Constraint): Observable<object> {
    const urlPart = 'observations/aggregates_per_concept';
    const body = {constraint: constraint.toQueryObject()};
    const responseField = 'aggregatesPerConcept';
    return this.postCall(urlPart, body, responseField);
  }

  // -------------------------------------- trial visit calls --------------------------------------
  /**
   * Given a constraint, normally a concept or a study constraint, return the corresponding trial visit list
   * @param constraint
   * @returns {Observable<R|T>}
   */
  getTrialVisits(constraint: Constraint): Observable<TrialVisit[]> {
    const constraintString = JSON.stringify(constraint.toQueryObject());
    const urlPart = `dimensions/trial visit/elements?constraint=${constraintString}`;
    const responseField = 'elements';
    return this.getCall(urlPart, responseField);
  }

  // -------------------------------------- pedigree calls --------------------------------------
  /**
   * Get the available pedigree relation types such as parent, child, spouse, sibling and various twin types
   * @returns {Observable<Object[]>}
   */
  getPedigreeRelationTypes(): Observable<PedigreeRelationTypeResponse[]> {
    const urlPart = 'pedigree/relation_types';
    const responseField = 'relationTypes';
    return this.getCall(urlPart, responseField);
  }

  // -------------------------------------- export calls --------------------------------------
  /**
   * Given a list of patient set ids as strings, get the corresponding data formats available for download
   * @param constraint
   * @returns {Observable<string[]>}
   */
  getExportDataFormats(constraint: Constraint): Observable<string[]> {
    const urlPart = 'export/data_formats';
    const body = {constraint: constraint.toQueryObject()};
    const responseField = 'dataFormats';
    return this.postCall(urlPart, body, responseField);
  }

  /**
   * Get the current user's existing export jobs
   * @returns {Observable<ExportJob[]>}
   */
  getExportJobs(): Observable<any[]> {
    const urlPart = 'export/jobs';
    const responseField = 'exportJobs';
    return this.getCall(urlPart, responseField);
  }

  /**
   * Create a new export job for the current user, with a given name
   * @param name
   * @returns {Observable<ExportJob>}
   */
  createExportJob(name: string): Observable<ExportJob> {
    const urlPart = `export/job?name=${name}`;
    const responseField = 'exportJob';
    return this.postCall(urlPart, {}, responseField);
  }

  /**
   * Run an export job:
   * the elements should be an array of objects like this -
   * [{
   *    dataType: 'clinical',
   *    format: 'TSV',
   *    dataView: 'surveyTable' // NTR specific
   * }]
   *
   * @param jobId
   * @param elements
   * @param constraint
   * @returns {Observable<ExportJob>}
   */
  runExportJob(jobId: string,
               constraint: Constraint,
               elements: object[]): Observable<ExportJob> {
    const urlPart = `export/${jobId}/run`;
    const responseField = 'exportJob';
    const body = {
      constraint: constraint.toQueryObject(),
      elements: elements
    };
    return this.postCall(urlPart, body, responseField);
  }

  /**
   * Given an export job id, return the blob (zipped file) ready to be used on frontend
   * @param jobId
   * @returns {Observable<blob>}
   */
  downloadExportJob(jobId: string) {
    let endpoint = this.endpointService.getEndpoint();
    let headers = new Headers();
    headers.append('Content-Type', 'application/zip');
    headers.append('Authorization', `Bearer ${endpoint.accessToken}`);
    let url = `${endpoint.getUrl()}/export/${jobId}/download`;
    const options = new RequestOptions({
      headers: headers,
      responseType: ResponseContentType.Blob
    });
    return this.http.get(url, options)
      .map((res: Response) => res)
      .catch(this.handleError.bind(this));
  }

  // -------------------------------------- query calls --------------------------------------
  /**
   * Get the queries that the current user has saved.
   * @returns {Observable<Query[]>}
   */
  getQueries(): Observable<Query[]> {
    const urlPart = `queries`;
    const responseField = 'queries';
    return this.getCall(urlPart, responseField);
  }

  /**
   * Save a new query.
   * @param {Object} queryBody
   * @returns {Observable<Query>}
   */
  saveQuery(queryBody: object): Observable<Query> {
    const urlPart = `queries`;
    return this.postCall(urlPart, queryBody, null);
  }

  /**
   * Modify an existing query.
   * @param {string} queryId
   * @param {Object} queryBody
   * @returns {Observable<Query>}
   */
  updateQuery(queryId: string, queryBody: object): Observable<{}> {
    const urlPart = `queries/${queryId}`;
    return this.putCall(urlPart, queryBody);
  }

  /**
   * Delete an existing query.
   * @param {string} queryId
   * @returns {Observable<any>}
   */
  deleteQuery(queryId: string): Observable<{}> {
    const urlPart = `queries/${queryId}`;
    return this.deleteCall(urlPart);
  }

  // -------------------------------------- patient set calls --------------------------------------
  savePatientSet(name: string, constraint: Constraint): Observable<PatientSetResponse> {
    const urlPart = `patient_sets?name=${name}`;
    const body = constraint.toQueryObject();
    return this.postCall(urlPart, body, null);
  }

}
