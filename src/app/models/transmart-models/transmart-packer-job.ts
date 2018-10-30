/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export class TransmartPackerJob {

  // The unique job id
  public task_id: string;
  // The type of the job that is triggered in the external tool
  public job_type: string;
  // The date of the job creation
  public created_at: string;
  // The parameters of the job, e.g. constraints, custom job name
  public job_parameters?: object;
  // The status of the job
  public status: string;
  // The user that created the job
  public user: string;

}
