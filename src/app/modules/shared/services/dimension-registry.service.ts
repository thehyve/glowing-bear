import {Injectable} from '@angular/core';
import {ResourceService} from './resource.service';
import {Study} from '../models/study';
import {Constraint} from '../models/constraints/constraint';
import {Concept} from '../models/concept';
import {StudyConstraint} from '../models/constraints/study-constraint';
import {ConceptConstraint} from '../models/constraints/concept-constraint';
import {CombinationConstraint} from '../models/constraints/combination-constraint';
import {SavedSet} from '../models/saved-set';

@Injectable()
export class DimensionRegistryService {

  private studies: Study[] = [];
  private studyConstraints: Constraint[] = [];
  private concepts: Concept[] = [];
  private conceptConstraints: Constraint[] = [];

  private patientSets: SavedSet[] = [];
  private observationSets: SavedSet[] = [];


  // List keeping track of all available constraints. By default, the empty
  // constraints are in here. In addition, (partially) filled constraints are
  // added. The constraints should be copied when editing them.
  private allConstraints: Constraint[] = [];

  constructor(private resourceService: ResourceService) {

    this.updateStudies();
    this.updateConcepts();
    this.updatePatientSets();

  }

  updateStudies() {
    this.resourceService.getStudies()
      .subscribe(
        studies => {
          // reset studies and study constraints
          this.studies = studies;
          this.studyConstraints = [];
          studies.forEach(study => {
            let constraint = new StudyConstraint();
            constraint.studies.push(study);
            this.studyConstraints.push(constraint);
          });
          this.updateAllConstraints();
        },
        err => console.error(err)
      );
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
      if (treeNode['dimension'] === 'concept') {

        // Only include non-FOLDERs and non-CONTAINERs
        if (treeNode['visualAttributes'].indexOf('FOLDER') === -1 &&
          treeNode['visualAttributes'].indexOf('CONTAINER') === -1) {

          let concept = new Concept();
          // TODO: retrieve concept path in less hacky manner:
          let path = treeNode['constraint']['path'];
          concept.path = path ? path : treeNode['fullName'];
          concept.type = treeNode['type'];
          this.concepts.push(concept);

          let constraint = new ConceptConstraint();
          constraint.concept = concept;
          this.conceptConstraints.push(constraint);
        }
      }

      // Recurse
      this.processTreeNodes(treeNode['children']);
    });
  }

  updateConcepts() {
    // Retrieve all tree nodes and extract the concepts
    this.resourceService.getAllTreeNodes()
      .subscribe(
        (treeNodes: object[]) => {
          // reset concepts and concept constraints
          this.concepts = [];
          this.conceptConstraints = [];
          this.processTreeNodes(treeNodes);
          this.updateAllConstraints();
        },
        err => console.error(err)
      );
  }

  updatePatientSets() {
    // reset patient sets
    this.resourceService.getPatientSets()
      .subscribe(
        sets => {
          // this is to retain the original reference pointer to the array
          this.patientSets.length = 0;

          // reverse the sets so that the latest patient set is on top
          sets.reverse();
          sets.forEach(set => {
            set.name = set.description;
            this.patientSets.push(set);
          });
        },
        err => console.error(err)
      );
  }

  updateAllConstraints() {
    this.allConstraints = [
      new CombinationConstraint(),
      new StudyConstraint(),
      new ConceptConstraint()
    ];

    this.allConstraints = this.allConstraints.concat(this.studyConstraints.concat(this.conceptConstraints));
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

  getObservationSets() {
    return this.observationSets;
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
