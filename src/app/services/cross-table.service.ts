import {Injectable} from '@angular/core';
import {CrossTable} from '../models/table-models/cross-table';
import {CategoricalAggregate} from '../models/constraint-models/categorical-aggregate';
import {Constraint} from '../models/constraint-models/constraint';
import {GbDraggableCellComponent} from '../modules/gb-analysis-module/gb-draggable-cell/gb-draggable-cell.component';
import {ValueConstraint} from '../models/constraint-models/value-constraint';
import {ResourceService} from './resource.service';
import {CombinationConstraint} from '../models/constraint-models/combination-constraint';
import {Aggregate} from '../models/constraint-models/aggregate';
import {ConstraintHelper} from '../utilities/constraint-helper';
import {ConceptConstraint} from '../models/constraint-models/concept-constraint';
import {CombinationState} from '../models/constraint-models/combination-state';

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

  constructor(private resourceService: ResourceService) {
    this._crossTable = new CrossTable();
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
      constraint.textRepresentation = ConstraintHelper.renderConstraint(constraint);
      let needsAggregateCall = false;
      // If the constraint has categorical concept, break it down to value constraints and add those respectively
      if (ConstraintHelper.isCategoricalConceptConstraint(constraint)) {
        needsAggregateCall = true;
        let categoricalConceptConstraint = <ConceptConstraint>constraint;
        this.retrieveAggregate(categoricalConceptConstraint, constraint);
      } else if (constraint.className === 'CombinationConstraint') {
        let combiConstraint = <CombinationConstraint>constraint;
        if (combiConstraint.isAnd()) {
          let categoricalConceptConstraints = combiConstraint.children.filter((child: Constraint) =>
            ConstraintHelper.isCategoricalConceptConstraint(child)
          );
          if (categoricalConceptConstraints.length === 1) {
            needsAggregateCall = true;
            this.retrieveAggregate(<ConceptConstraint>categoricalConceptConstraints[0], constraint);
          }
        }
      }
      // If the constraint has no categorical concept, add the constraint directly to value constraint list
      if (!needsAggregateCall) {
        this.crossTable.addValueConstraints(constraint, [constraint]);
      }
    }
    this.updateCells();
  }

  public updateHeaderConstraints() {
    this.crossTable.rowHeaderConstraints = this.crossConstraints(this.rowConstraints);
    this.crossTable.columnHeaderConstraints = this.crossConstraints(this.columnConstraints);
  }

  /**
   * Compute combinations of all value constraints for each of the (concept) constraints
   * in the provided list of constraints.
   * This fetches value constraints for each of the provided constraints.
   * The result will be a list with constraint tuples. Each of the tuples has as many
   * constraints as constraints in the input list and will be a combination of an input constraint
   * with a value constraint.
   *
   * Example: for an input list [ConceptConstraint('foo'), ConceptConstraint('bar')] and a value
   * mapping {'foo' => [ValueConstraint('a')], 'bar' => [ValueConstraint('x'), ValueConstraint('y')]},
   * this will generate the combinations:
   * [
   *   [Combination([ConceptConstraint('foo'), ValueConstraint('a')], Combination([ConceptConstraint('bar'), ValueConstraint('x')])],
   *   [Combination([ConceptConstraint('foo'), ValueConstraint('a')], Combination([ConceptConstraint('bar'), ValueConstraint('y')])]
   * ]
   *
   * @param {Constraint[]} constraints
   * @return {Constraint[][]}
   */
  public crossConstraints(constraints: Constraint[]): Constraint[][] {
    let constraintsWithValues = constraints.map(constraint => {
      let valuesForConstraint = this.valueConstraints.get(constraint);
      return valuesForConstraint.map(valueConstraint => {
        let combination = new CombinationConstraint();
        combination.combinationState = CombinationState.And;
        combination.addChild(constraint);
        combination.addChild(valueConstraint);
        combination.textRepresentation = valueConstraint.textRepresentation;
        return combination;
      })
    });
    return ConstraintHelper.permuteConstraints(constraintsWithValues);
  }

  /**
   * a. call resource service to get the new cells for the table,
   * b. replace the old cells with the new cells
   * c. construct rows and cols based on the new cells
   */
  public updateCells() {
    if (this.areValueConstraintsMapped) {
      this.updateHeaderConstraints();
      this.resourceService.getCrossTable(this.crossTable)
        .subscribe((crossTable: CrossTable) => {
          this._crossTable = crossTable;
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
    return ConstraintHelper.isCategoricalConceptConstraint(constraint)
      || ConstraintHelper.isConjunctiveAndHasOneCategoricalConstraint(constraint);
  }

  private clearValueConstraints(targetConstraints: Constraint[]) {
    targetConstraints.forEach((target: Constraint) => {
      if (this.valueConstraints.get(target)) {
        this.valueConstraints.get(target).length = 0;
      }
    });
  }

  private retrieveAggregate(categoricalConceptConstraint: ConceptConstraint,
                            peerConstraint: Constraint) {
    if (categoricalConceptConstraint.concept.aggregate) {
      const categoricalAggregate = <CategoricalAggregate>categoricalConceptConstraint.concept.aggregate;
      this.addCategoricalValueConstraints(categoricalAggregate, peerConstraint);
    } else {
      this.resourceService.getAggregate(categoricalConceptConstraint)
        .subscribe((responseAggregate: Aggregate) => {
          const categoricalAggregate = <CategoricalAggregate>responseAggregate;
          this.addCategoricalValueConstraints(categoricalAggregate, peerConstraint);
        });
    }
  }

  private addCategoricalValueConstraints(categoricalAggregate: CategoricalAggregate,
                                             peerConstraint: Constraint) {
    let valueConstraints = categoricalAggregate.values.map((value) => {
      let val = new ValueConstraint();
      val.valueType = 'STRING';
      val.operator = '=';
      val.value = value;
      val.textRepresentation = val.value.toString();
      return val;
    });
    this.crossTable.addValueConstraints(peerConstraint, valueConstraints);
  }

  get areValueConstraintsMapped(): boolean {
    return  this.rowConstraints.every((constraint: Constraint) => {
              return this.valueConstraints.has(constraint);
            }) &&
            this.columnConstraints.every((constraint: Constraint) => {
              return this.valueConstraints.has(constraint);
            });
  }

  get crossTable(): CrossTable {
    return this._crossTable;
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

}
