import {Injectable} from '@angular/core';
import {Workflow} from "../models/workflow";

@Injectable()
export class WorkflowService {
  public what: string[];

  private workflow: Workflow;

  constructor() {
    this.workflow = new Workflow();
    this.what = [];
  }

  getCurrentWorkflow(): Workflow {

    return this.workflow;
  }

}
