import { Injectable } from '@angular/core';
import {ResourceService} from "./resource.service";
import {Study} from "../models/study";

@Injectable()
export class DimensionRegistryService {

  private studies:Study[];

  constructor(private resourceService:ResourceService) {

    this.resourceService.getStudies()
      .subscribe(
        studies => this.studies = studies,
        err => console.error(err)
      );

  }

  getStudies() {
    return this.studies;
  }

}
