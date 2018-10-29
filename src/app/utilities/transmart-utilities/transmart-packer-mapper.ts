/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {ExportJob} from '../../models/export-models/export-job';
import {TransmartPackerJob} from '../../models/transmart-models/transmart-packer-job';

const statusDictionary: { [status: string]: string | undefined } = {
  REGISTERED: 'Created',
  CANCELLED: 'Cancelled',
  FETCHING: 'Fetching',
  RUNNING: 'Running',
  SUCCESS: 'Completed',
  FAILED: 'Error. Contact administrator.'
};

export class TransmartPackerMapper {

  static mapCustomExportJob(job: TransmartPackerJob): ExportJob {
    let ej = new ExportJob();
    if (job) {
      ej.id = job.task_id;
      ej.jobName = job.job_parameters['custom_name'] ? job.job_parameters['custom_name'] : job.task_id;
      ej.jobStatus = statusDictionary[job.status];
      ej.jobStatusTime = job.created_at;
      ej.userId = job.user;
    }
    return ej;
  }

  static mapCustomExportJobs(exJobs: TransmartPackerJob[]): ExportJob[] {
    let jobs: ExportJob[] = [];
    exJobs.forEach(exJob => {
      try {
        let job = this.mapCustomExportJob(exJob);
        jobs.push(job);
      } catch (err) {
        console.error(`Error while mapping external job: ${exJob.task_id}`, exJob);
      }
    });
    return jobs;
  }

}
