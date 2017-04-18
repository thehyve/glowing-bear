import { Injectable } from '@angular/core';
import {ResourceService} from "./resource.service";
import {Study} from "../models/study";
import {Constraint} from "../models/constraints/constraint";
import {Concept} from "../models/concept";
import {StudyConstraint} from "../models/constraints/study-constraint";
import {ConceptConstraint} from "../models/constraints/concept-constraint";

@Injectable()
export class DimensionRegistryService {

  private studies:Study[] = [];
  private concepts:Concept[] = [];

  private emptyConstraints:Constraint[] = [
    new StudyConstraint(),
    new ConceptConstraint
  ];


  constructor(private resourceService:ResourceService) {

    // Retrieve available studies
    this.resourceService.getStudies()
      .subscribe(
        studies => this.studies = studies,
        err => console.error(err)
      );

    // Retrieve all tree nodes and extract the concepts
    this.resourceService.getTreeNodes()
      .subscribe(
        (treeNodes:object[]) => {
          console.log(treeNodes);
          this.processTreeNodes(treeNodes);
        },
        err => console.error(err)
      );


  }

  private processTreeNodes(treeNodes:object[]) {
    treeNodes.forEach(treeNode => {
      if (treeNode['dimension'] == 'concept') {
        let concept = new Concept();
        concept.path = treeNode['fullName'];
        this.concepts.push(concept);
      }
    });
  }

  getStudies() {
    return this.studies;
  }

  searchAllConstraints(query:string):Constraint[] {
    console.log(query);
    return this.emptyConstraints;
  }

}
