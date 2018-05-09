import {Injectable} from '@angular/core';
import {CrossTable} from '../models/table-models/cross-table';
import {ConceptConstraint} from '../models/constraint-models/concept-constraint';
import {Concept} from '../models/constraint-models/concept';
import {CategoricalAggregate} from '../models/constraint-models/categorical-aggregate';
import {Constraint} from '../models/constraint-models/constraint';
import {GbDraggableCellComponent} from '../modules/gb-analysis-module/gb-draggable-cell/gb-draggable-cell.component';
import {ConceptType} from '../models/constraint-models/concept-type';
import {ValueConstraint} from '../models/constraint-models/value-constraint';
import {ResourceService} from './resource.service';
import {CombinationConstraint} from '../models/constraint-models/combination-constraint';
import {Aggregate} from '../models/constraint-models/aggregate';
import {AxisType} from '../models/table-models/axis-type';
import {ConstraintService} from './constraint.service';
import {Row} from '../models/table-models/row';
import {FormatHelper} from '../utilities/FormatHelper';
import {Col} from '../models/table-models/col';

@Injectable()
export class CrossTableService {

  // the drag and drop context used by primeng library to associate draggable and droppable items
  // this constant is used by gb-draggable-cell and gb-droppable-zone
  public readonly PrimeNgDragAndDropContext = 'PrimeNgDragAndDropContext';
  private _crossTable: CrossTable;
  private _selectedConstraintCell: GbDraggableCellComponent;

  constructor(private resourceService: ResourceService,
              private constraintService: ConstraintService) {
    this.crossTable = new CrossTable();
    this.init();
  }

  /**
   * Initialize the cross table
   */
  public init() {
    this.mockDataInit();
  }

  public updateRows() {
    this.mockDataUpdate();
  }

  /**
   * Update the cross table
   */
  // public update() {
  //   this.mockDataUpdate();
  // }

  /**
   * This function is used to generate the header constraint(s) for the cross table:
   * Given a constraint, check if it is a categorical concept constraint,
   * if yes, fetch its aggregate, assign the target with a list of aggregate-value constraints
   *
   * else, check if it is a AND-combination constraint with only one categorical concept constraint child,
   * if yes, fetch the aggregate for this child, assign the target with a list of aggregate-value constraints
   *
   * else, assign the target with the constraint itself
   * @param {Array<Constraint>} constraints - the row/column constraints of the cross table
   */
  public updateHeaderConstraints(constraints: Array<Constraint>) {
    // clear existing header constraints
    this.clearHeaderConstraints(constraints);
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
      // If the constraint has no categorical concept, add the constraint directly to header constraint list
      if (!needsAggregateCall) {
        this.crossTable.addHeaderConstraint(constraint, constraint);
      }
    }
  }

  private clearHeaderConstraints(targetConstraints: Constraint[]) {
    targetConstraints.forEach((target: Constraint) => {
      if (this.headerConstraints.get(target)) {
        this.headerConstraints.get(target).length = 0;
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

  public isValidConstraint(constraint: Constraint): boolean {
    return this.constraintService.isCategoricalConceptConstraint(constraint)
      || this.isConjunctiveAndHasOneCategoricalConstraint(constraint);
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
      this.crossTable.addHeaderConstraint(peerConstraint, combi);
    }
    this.updateRows();
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

  get areHeaderConstraintsMapped(): boolean {
    let mapped = true;
    this.rowConstraints.forEach((con: Constraint) => {
      let hasIt = this.headerConstraints.has(con);
      if (!hasIt) {
        mapped = hasIt;
      }
    });
    if (mapped) {
      this.columnConstraints.forEach((con: Constraint) => {
        let hasIt = this.headerConstraints.has(con);
        if (!hasIt) {
          mapped = hasIt;
        }
      });
    }
    return mapped;
  }

  mockDataInit() {
    let c1 = new Concept();
    c1.name = 'Race';
    c1.label = 'Race';
    c1.type = ConceptType.CATEGORICAL;
    let agg1 = new CategoricalAggregate();
    agg1.valueCounts.set('caucasian', 100);
    agg1.valueCounts.set('latino', 200);
    agg1.valueCounts.set('asian', 300);
    c1.aggregate = agg1;

    let c2 = new Concept();
    c2.name = 'Gender';
    c2.label = 'Gender';
    c2.type = ConceptType.CATEGORICAL;
    let agg2 = new CategoricalAggregate();
    agg2.valueCounts.set('male', 300);
    agg2.valueCounts.set('female', 400);
    c2.aggregate = agg2;

    let c3 = new Concept();
    c3.name = 'Color';
    c3.label = 'Color';
    c3.type = ConceptType.CATEGORICAL;
    let agg3 = new CategoricalAggregate();
    agg3.valueCounts.set('red', 11);
    agg3.valueCounts.set('yellow', 15);
    agg3.valueCounts.set('blue', 12);
    agg3.valueCounts.set('black', 20);
    agg3.valueCounts.set('white', 9);
    c3.aggregate = agg3;

    let c4 = new Concept();
    c4.name = 'Alcohol';
    c4.label = 'Alcohol';
    c4.type = ConceptType.CATEGORICAL;
    let agg4 = new CategoricalAggregate();
    agg4.valueCounts.set('wine', 11);
    agg4.valueCounts.set('beer', 15);
    agg4.valueCounts.set('vodka', 12);
    c4.aggregate = agg4;

    let cc1 = new ConceptConstraint();
    cc1.concept = c1;
    cc1.textRepresentation = '<Race>';
    let cc2 = new ConceptConstraint();
    cc2.concept = c2;
    cc2.textRepresentation = '<Gender>';
    let cc3 = new ConceptConstraint();
    cc3.concept = c3;
    cc3.textRepresentation = '<Color>';
    let cc4 = new ConceptConstraint();
    cc4.concept = c4;
    cc4.textRepresentation = '<Alcohol>';
    this.crossTable.rowConstraints.push(cc1);
    this.crossTable.rowConstraints.push(cc2);
    this.crossTable.columnConstraints.push(cc3);
    this.crossTable.columnConstraints.push(cc4);
    // Update the header constraints
    this.updateHeaderConstraints(this.rowConstraints);
    this.updateHeaderConstraints(this.columnConstraints);
    this.updateRows();
  }

  mockDataUpdate() {
    if (this.areHeaderConstraintsMapped) {
      // clear the rows and cols
      this.crossTable.rows = [];
      this.crossTable.cols = [];
      // generate the column-header rows
      let numColDimColumns = this.columnConstraints.length > 0 ? 1 : 0;
      for (let colConstraint of this.columnConstraints) {
        let valConstraints = this.headerConstraints.get(colConstraint);
        numColDimColumns = numColDimColumns * valConstraints.length;
        let row = new Row();
        // add empty space fillers on the top-left corner of the table
        for (let rowIndex = 0; rowIndex < this.rowConstraints.length; rowIndex++) {
          row.addDatumObject({
            isHeader: false,
            value: ''
          });
        }
        // add the column header names
        let above = this.getConstraintsAbove(colConstraint, this.columnConstraints);
        let selfRepetition = 1;
        for (let cAbove of above) {
          selfRepetition = selfRepetition * this.headerConstraints.get(cAbove).length;
        }
        let below = this.getConstraintsBelow(colConstraint, this.columnConstraints);
        let valueRepetition = 1;
        for (let cBelow of below) {
          valueRepetition = valueRepetition * this.headerConstraints.get(cBelow).length;
        }
        for (let i = 0; i < selfRepetition; i++) {
          for (let child of this.headerConstraints.get(colConstraint)) {
            for (let j = 0; j < valueRepetition; j++) {
              row.addDatumObject({
                isHeader: true,
                value: child.textRepresentation
              });
            }
          }
        }
        this.rows.push(row);
      }

      // generate the data rows
      let dataRows = [];
      let rowCon0 = this.rowConstraints[0];
      // if there at least one row constraint
      if (rowCon0) {
        let consRight0 = this.getConstraintsBelow(rowCon0, this.rowConstraints);
        let valueRepetition0 = 1;
        for (let conRight of consRight0) {
          valueRepetition0 = valueRepetition0 * this.headerConstraints.get(conRight).length;
        }
        for (let val of this.headerConstraints.get(rowCon0)) {
          for (let j = 0; j < valueRepetition0; j++) {
            let row = new Row();
            row.addDatumObject({
              isHeader: true,
              value: val.textRepresentation
            });
            dataRows.push(row);
          }
        }
        let index = 0;
        for (let rowIndex = 1; rowIndex < this.rowConstraints.length; rowIndex++) {
          let rowCon = this.rowConstraints[rowIndex];
          let consLeft = this.getConstraintsAbove(rowCon, this.rowConstraints);
          let selfRepetition = 1;
          for (let conLeft of consLeft) {
            selfRepetition = selfRepetition * this.headerConstraints.get(conLeft).length;
          }
          let consRight = this.getConstraintsBelow(rowCon, this.rowConstraints);
          let valueRepetition = 1;
          for (let conRight of consRight) {
            valueRepetition = valueRepetition * this.headerConstraints.get(conRight).length;
          }
          for (let i = 0; i < selfRepetition; i++) {
            for (let val of this.headerConstraints.get(rowCon)) {
              for (let j = 0; j < valueRepetition; j++) {
                dataRows[index].addDatumObject({
                  isHeader: true,
                  value: val.textRepresentation
                });
                let nIndex = index + 1;
                index = (nIndex === dataRows.length) ? 0 : nIndex;
              }
            }
          }
        }
      } else {// if there is no row dimension
        dataRows.push(new Row());
      }
      for (let dataRow of dataRows) {
        for (let i = 0; i < numColDimColumns; i++) {
          dataRow.addDatumObject({
            isHeader: false,
            value: 'Num'
          });
        }
        if (numColDimColumns === 0) {
          dataRow.addDatumObject({
            isHeader: false,
            value: 'Num'
          });
        }
        this.rows.push(dataRow);
      }

      // generate column headers
      for (let field in this.rows[0].data) {
        let col = new Col(' - ', field);
        this.cols.push(col);
      }
    }
  }

  private getConstraintsBelow(current: Constraint, list: Constraint[]): Constraint[] {
    let below = [];
    let index = list.indexOf(current);
    for (let i = index + 1; i < list.length; i++) {
      below.push(list[i]);
    }
    return below;
  }

  private getConstraintsAbove(current: Constraint, list: Constraint[]): Constraint[] {
    let above = [];
    let index = list.indexOf(current);
    for (let i = index - 1; i >= 0; i--) {
      above.push(list[i]);
    }
    return above;
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

  get headerConstraints(): Map<Constraint, Array<Constraint>> {
    return this.crossTable.headerConstraints;
  }

  get rows(): Array<Row> {
    return this.crossTable.rows;
  }

  get cols(): Array<Col> {
    return this.crossTable.cols;
  }

}
