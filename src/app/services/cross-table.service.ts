import {Injectable} from '@angular/core';
import {CrossTable} from '../models/table-models/cross-table';
import {ConceptConstraint} from '../models/constraint-models/concept-constraint';
import {CategoricalAggregate} from '../models/constraint-models/categorical-aggregate';
import {Constraint} from '../models/constraint-models/constraint';
import {GbDraggableCellComponent} from '../modules/gb-analysis-module/gb-draggable-cell/gb-draggable-cell.component';
import {ValueConstraint} from '../models/constraint-models/value-constraint';
import {ResourceService} from './resource.service';
import {CombinationConstraint} from '../models/constraint-models/combination-constraint';
import {Aggregate} from '../models/constraint-models/aggregate';
import {ConstraintService} from './constraint.service';
import {Row} from '../models/table-models/row';
import {FormatHelper} from '../utilities/FormatHelper';
import {Col} from '../models/table-models/col';

@Injectable()
export class CrossTableService {

  /*
   * General workflow of this service
   * 1. (updateValueConstraints) - if a new row/col constraint is introduced to the table,
   *    retrieve the aggregate and update the value constraints
   * 2. (updateCells) - when the value constraints are up to date,
   *    first update the header constraints, which form the headers of the table,
   *    and are used for backend calls, then update the cells by making the getCrossTable call
   */
  // the drag and drop context used by primeng library to associate draggable and droppable items
  // this constant is used by gb-draggable-cell and gb-droppable-zone
  public readonly PrimeNgDragAndDropContext = 'PrimeNgDragAndDropContext';
  private _crossTable: CrossTable;
  private _selectedConstraintCell: GbDraggableCellComponent;

  constructor(private resourceService: ResourceService,
              private constraintService: ConstraintService) {
    this.crossTable = new CrossTable();
  }

  /**
   * This function is used to generate the value constraint(s) for the cross table:
   * Given a constraint, check if it is a categorical concept constraint,
   * if yes, fetch its aggregate, assign the target with a list of aggregate-value constraints
   *
   * else, check if it is a AND-combination constraint with only one categorical concept constraint child,
   * if yes, fetch the aggregate for this child, assign the target with a list of aggregate-value constraints
   *
   * else, assign the target with the constraint itself
   *
   * *** Remark ***
   * Only use this function when new constraint got introduced into the table,
   * since the value constraints will be recreated and old pointers are lost,
   * the cells of the table will also be renewed
   *
   * @param {Array<Constraint>} constraints - the row/column constraints of the cross table
   */
  public updateValueConstraints(constraints: Array<Constraint>) {
    // clear existing value constraints
    this.clearValueConstraints(constraints);
    for (let constraint of constraints) {
      let needsAggregateCall = false;
      // If the constraint has categorical concept, break it down to value constraints and add those respectively
      if (this.constraintService.isCategoricalConceptConstraint(constraint)) {
        needsAggregateCall = true;
        let categoricalConceptConstraint = <ConceptConstraint>constraint;
        this.retrieveAggregate(categoricalConceptConstraint, constraint);
      } else if (constraint.getClassName() === 'CombinationConstraint') {
        let combiConstraint = <CombinationConstraint>constraint;
        if (combiConstraint.isAnd()) {
          let numCategoricalConceptConstraints = 0;
          let categoricalChild = null;
          combiConstraint.children.forEach((child: Constraint) => {
            if (this.constraintService.isCategoricalConceptConstraint(child)) {
              numCategoricalConceptConstraints++;
              categoricalChild = child;
            }
          });
          if (numCategoricalConceptConstraints === 1) {
            needsAggregateCall = true;
            this.retrieveAggregate(categoricalChild, constraint);
          }
        }
      }
      // If the constraint has no categorical concept, add the constraint directly to value constraint list
      if (!needsAggregateCall) {
        this.crossTable.addValueConstraint(constraint, constraint);
      }
    }
    this.updateCells();
  }

  /**
   * a. call resource service to get the new cells for the table,
   * b. replace the old cells with the new cells
   * c. construct rows and cols based on the new cells
   */
  public updateCells() {
    if (this.areValueConstraintsMapped) {
      this.crossTable.updateHeaderConstraints();
      this.resourceService.getCrossTable(this.crossTable)
        .subscribe((crossTable: CrossTable) => {
          this.crossTable = crossTable;
        });
    } else {
      window.setTimeout((function () {
        this.updateCells();
      }).bind(this), 500);
    }
  }

  /**
   * Check if a given constraint is usable in cross table
   * @param {Constraint} constraint
   * @returns {boolean}
   */
  public isValidConstraint(constraint: Constraint): boolean {
    return this.constraintService.isCategoricalConceptConstraint(constraint)
      || this.isConjunctiveAndHasOneCategoricalConstraint(constraint);
  }

  private clearValueConstraints(targetConstraints: Constraint[]) {
    targetConstraints.forEach((target: Constraint) => {
      if (this.valueConstraints.get(target)) {
        this.valueConstraints.get(target).length = 0;
      }
    });
  }

  private isConjunctiveAndHasOneCategoricalConstraint(constraint: Constraint): boolean {
    if (constraint.getClassName() === 'CombinationConstraint') {
      let combiConstraint = <CombinationConstraint>constraint;
      if (combiConstraint.isAnd()) {
        let numCategoricalConceptConstraints = 0;
        let categoricalChild: ConceptConstraint = null;
        combiConstraint.children.forEach((child: Constraint) => {
          if (this.constraintService.isCategoricalConceptConstraint(child)) {
            numCategoricalConceptConstraints++;
            categoricalChild = <ConceptConstraint>child;
          }
        });
        if (numCategoricalConceptConstraints === 1) {
          // adjust its text representation to its categorical child's name
          combiConstraint.textRepresentation = categoricalChild.concept.name;
          return true;
        }
      }
    }
    return false;
  }

  private retrieveAggregate(categoricalConceptConstraint: ConceptConstraint,
                            peerConstraint: Constraint) {
    if (categoricalConceptConstraint.concept.aggregate) {
      const categoricalAggregate = <CategoricalAggregate>categoricalConceptConstraint.concept.aggregate;
      this.composeCategoricalValueConstraints(categoricalAggregate, peerConstraint);
    } else {
      this.resourceService.getAggregate(categoricalConceptConstraint)
        .subscribe((responseAggregate: Aggregate) => {
          const categoricalAggregate = <CategoricalAggregate>responseAggregate;
          this.composeCategoricalValueConstraints(categoricalAggregate, peerConstraint);
        });
    }
  }

  private composeCategoricalValueConstraints(categoricalAggregate: CategoricalAggregate,
                                             peerConstraint: Constraint) {
    let categories = categoricalAggregate.values;
    for (let category of categories) {
      let val = new ValueConstraint();
      val.valueType = 'STRING';
      val.operator = '=';
      val.value = (category === FormatHelper.nullValuePlaceholder) ? null : category;
      val.textRepresentation = val.value.toString();
      let combi = new CombinationConstraint();
      combi.addChild(peerConstraint);
      combi.addChild(val);
      combi.textRepresentation = this.adjustCombinationConstraintTextRepresentation(combi);
      this.crossTable.addValueConstraint(peerConstraint, combi);
    }
  }

  private adjustCombinationConstraintTextRepresentation(constraint: CombinationConstraint): string {
    let description = constraint.textRepresentation;
    if (constraint.isAnd()) {
      let numValueConstraints = 0;
      let numCatConceptConstraints = 0;
      let valChild = null;
      let catChild = null;
      constraint.children.forEach((child: Constraint) => {
        if (child.getClassName() === 'ValueConstraint') {
          numValueConstraints++;
          valChild = child;
        } else if (this.constraintService.isCategoricalConceptConstraint(child)) {
          numCatConceptConstraints++;
          catChild = child;
        }
      });
      if (numValueConstraints === 1) {
        description = valChild.textRepresentation;
      } else if (numCatConceptConstraints === 1) {
        description = catChild.textRepresentation;
      }
    }

    return description;
  }

  get areValueConstraintsMapped(): boolean {
    let mapped = true;
    this.rowConstraints.forEach((con: Constraint) => {
      let hasIt = this.valueConstraints.has(con);
      if (!hasIt) {
        mapped = false;
      }
    });
    if (mapped) {
      this.columnConstraints.forEach((con: Constraint) => {
        let hasIt = this.valueConstraints.has(con);
        if (!hasIt) {
          mapped = false;
        }
      });
    }
    return mapped;
  }

  get crossTable(): CrossTable {
    return this._crossTable;
  }

  set crossTable(value: CrossTable) {
    this._crossTable = value;
  }

  get selectedConstraintCell(): GbDraggableCellComponent {
    return this._selectedConstraintCell;
  }

  set selectedConstraintCell(value: GbDraggableCellComponent) {
    this._selectedConstraintCell = value;
  }

  get rowConstraints(): Array<Constraint> {
    return this.crossTable.rowConstraints;
  }

  get columnConstraints(): Array<Constraint> {
    return this.crossTable.columnConstraints;
  }

  get valueConstraints(): Map<Constraint, Array<Constraint>> {
    return this.crossTable.valueConstraints;
  }

  get rows(): Array<Row> {
    return this.crossTable.rows;
  }

  get cols(): Array<Col> {
    return this.crossTable.cols;
  }

}
