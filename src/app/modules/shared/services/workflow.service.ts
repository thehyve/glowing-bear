import { Injectable } from '@angular/core';
import {Workflow} from "../models/workflow";

@Injectable()
export class WorkflowService {

  private workflow: Workflow;

  constructor() { }

  getCurrentWorkflow(): Workflow {

    return this.workflow;
  }

}
