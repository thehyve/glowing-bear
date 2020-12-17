/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ApiI2b2Panel } from "app/models/api-request-models/medco-node/api-i2b2-panel";
import { ApiI2b2Timing } from "app/models/api-request-models/medco-node/api-i2b2-timing";

export class ApiCohortResponse {
  cohortName: string;
  queryId: number;
  patientSetID: number;
  creationDate: string;
  updateDate: string;
  queryDefinition?: QueryDefinition;
}

class QueryDefinition {
  panels: ApiI2b2Panel[];
  queryTiming : ApiI2b2Timing;
}
