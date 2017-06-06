import {Injectable} from '@angular/core';
import {ResourceService} from "./resource.service";
import {Study} from "../models/study";
import {Constraint} from "../models/constraints/constraint";
import {Concept} from "../models/concept";
import {StudyConstraint} from "../models/constraints/study-constraint";
import {ConceptConstraint} from "../models/constraints/concept-constraint";
import {CombinationConstraint} from "../models/constraints/combination-constraint";
import {PatientSet} from "../models/patient-set";

@Injectable()
export class DimensionRegistryService {


  private studies: Study[] = [];
  private concepts: Concept[] = [];
  private patientSets: PatientSet[] = [];


  // List keeping track of all available constraints. By default, the empty
  // constraints are in here. In addition, (partially) filled constraints are
  // added. The constraints should be copied when editing them.
  private allConstraints: Constraint[] = [
    new CombinationConstraint(),
    new StudyConstraint(),
    new ConceptConstraint()
  ];

  constructor(private resourceService: ResourceService) {

    // Retrieve available studies
    this.resourceService.getStudies()
      .subscribe(
        studies => {
          this.studies = studies;
          studies.forEach(study => {
            let constraint = new StudyConstraint();
            constraint.studies.push(study);
            this.allConstraints.push(constraint);
          })
        },
        err => console.error(err)
      );

    // Retrieve all tree nodes and extract the concepts
    this.resourceService.getTreeNodes()
      .subscribe(
        (treeNodes: object[]) => {
          this.processTreeNodes(treeNodes);
        },
        err => console.error(err)
      );

    // Retrieve all the saved patient sets
    // TODO: connect to real backend call
    this.patientSets = resourceService.getPatientSets();

  }

  /** Extracts concepts (and later possibly other dimensions) from the
   *  provided TreeNode array and their children.
   * @param treeNodes
   */
  private processTreeNodes(treeNodes: object[]) {
    if (!treeNodes) {
      return;
    }

    treeNodes.forEach(treeNode => {

      // Extract concept
      if (treeNode['dimension'] == 'concept') {

        // Only include non-FOLDERs and non-CONTAINERs
        if (treeNode['visualAttributes'].indexOf('FOLDER') == -1 &&
          treeNode['visualAttributes'].indexOf('CONTAINER') == -1) {

          let concept = new Concept();
          //TODO: retrieve concept path in less hacky manner:
          let path = treeNode['constraint']['path'];
          concept.path = path ? path : treeNode['fullName'];
          concept.type = treeNode['type'];
          this.concepts.push(concept);

          let constraint = new ConceptConstraint();
          constraint.concept = concept;
          this.allConstraints.push(constraint);
        }
      }

      // Recurse
      this.processTreeNodes(treeNode['children']);
    });
  }

  getStudies() {
    return this.studies;
  }

  getConcepts() {
    return this.concepts;
  }

  getPatientSets() {
    return this.patientSets;
  }

  /**
   * Returns a list of all constraints that match the query string.
   * The constraints should be copied when editing them.
   * @param query
   * @returns {Array}
   */
  searchAllConstraints(query: string): Constraint[] {
    query = query.toLowerCase();
    let results = [];
    this.allConstraints.forEach((constraint: Constraint) => {
      let text = constraint.textRepresentation.toLowerCase();
      if (text.indexOf(query) > -1) {
        results.push(constraint);
      }
    });
    return results;
  }

}
