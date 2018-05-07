import {Injectable} from '@angular/core';
import {CrossTable} from '../models/table-models/cross-table';
import {ConceptConstraint} from '../models/constraint-models/concept-constraint';
import {Concept} from '../models/constraint-models/concept';
import {CategoricalAggregate} from '../models/constraint-models/categorical-aggregate';
import {Constraint} from '../models/constraint-models/constraint';
import {GbDraggableCellComponent} from '../modules/gb-analysis-module/gb-draggable-cell/gb-draggable-cell.component';
import {Row} from '../models/table-models/row';
import {ConceptType} from '../models/constraint-models/concept-type';
import {AggregateType} from '../models/constraint-models/aggregate-type';
import {ValueConstraint} from '../models/constraint-models/value-constraint';
import {ResourceService} from './resource.service';
import {CombinationConstraint} from '../models/constraint-models/combination-constraint';
import {Aggregate} from '../models/constraint-models/aggregate';
import {AxisType} from '../models/table-models/axis-type';

@Injectable()
export class CrossTableService {

  private _crossTable: CrossTable;
  private _selectedConstraintCell: GbDraggableCellComponent;

  constructor(private resourceService: ResourceService) {
    this.crossTable = new CrossTable();
    this.mockDataInit();
  }

  public updateAllHeaderConstraints() {
    this.crossTable.rowHeaderConstraints = [];
    this.updateHeaderConstraints(this.crossTable.rowConstraints, AxisType.ROW);
    this.crossTable.columnHeaderConstraints = [];
    this.updateHeaderConstraints(this.crossTable.columnConstraints, AxisType.COL);
  }

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
   * @param {AxisType} axis - enum indicating which axis of header constraints to update
   */
  private updateHeaderConstraints(constraints: Array<Constraint>, axis: AxisType) {
    for (let constraint of constraints) {
      if (this.isCategoricalConceptConstraint(constraint)) {
        let categoricalConceptConstraint = <ConceptConstraint>constraint;
        this.retrieveAggregate(categoricalConceptConstraint, constraint, axis);
      } else if (constraint.getClassName() === 'CombinationConstraint') {
        let combiConstraint = <CombinationConstraint>constraint;
        if (combiConstraint.isAnd()) {
          let numCategoricalConceptConstraints = 0;
          let categoricalChild = null;
          combiConstraint.children.forEach((child: Constraint) => {
            if (this.isCategoricalConceptConstraint(child)) {
              numCategoricalConceptConstraints++;
              categoricalChild = child;
            }
          });
          if (numCategoricalConceptConstraints === 1) {
            this.retrieveAggregate(categoricalChild, constraint, axis);
          }
        }
      }
    }
  }

  private isCategoricalConceptConstraint(constraint: Constraint): boolean {
    let result = false;
    if (constraint.getClassName() === 'ConceptConstraint') {
      let conceptConstraint = <ConceptConstraint>constraint;
      result = conceptConstraint.concept.type === ConceptType.CATEGORICAL;
    }
    return result;
  }

  private retrieveAggregate(categoricalConceptConstraint: ConceptConstraint,
                            peerConstraint: Constraint,
                            axis: AxisType) {
    if (categoricalConceptConstraint.concept.aggregate) {
      const categoricalAggregate = <CategoricalAggregate>categoricalConceptConstraint.concept.aggregate;
      this.composeCategoricalValueConstraints(categoricalAggregate, peerConstraint, axis);
    } else {
      this.resourceService.getAggregate(categoricalConceptConstraint)
        .subscribe((responseAggregate: Aggregate) => {
          const categoricalAggregate = <CategoricalAggregate>responseAggregate;
          this.composeCategoricalValueConstraints(categoricalAggregate, peerConstraint, axis);
        });
    }
  }

  private composeCategoricalValueConstraints(categoricalAggregate: CategoricalAggregate,
                                             peerConstraint: Constraint,
                                             axis: AxisType) {
    let categories = categoricalAggregate.values;
    let result = new Array<Constraint>();
    for (let category of categories) {
      let val = new ValueConstraint();
      val.valueType = 'STRING';
      val.operator = '=';
      val.value = (category === ResourceService.nullValuePlaceholder) ? null : category;
      let combination = new CombinationConstraint();
      combination.addChild(peerConstraint);
      combination.addChild(val);
      result.push(combination);
    }
    if (axis === AxisType.ROW) {
      this.crossTable.rowHeaderConstraints = this.crossTable.rowHeaderConstraints.concat(result);
    } else {
      this.crossTable.columnHeaderConstraints = this.crossTable.columnHeaderConstraints.concat(result);
    }
  }

  mockDataInit() {
    let c1 = new Concept();
    c1.name = 'Race';
    c1.label = 'Race';
    c1.type = ConceptType.CATEGORICAL;
    let agg1 = new CategoricalAggregate();
    agg1.valueCounts.set('caucasian', 100);
    agg1.valueCounts.set('latino', 200);
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
    let cc2 = new ConceptConstraint();
    cc2.concept = c2;
    let cc3 = new ConceptConstraint();
    cc3.concept = c3;
    let cc4 = new ConceptConstraint();
    cc4.concept = c4;
    this.crossTable.rowConstraints.push(cc1);
    this.crossTable.rowConstraints.push(cc2);
    this.crossTable.columnConstraints.push(cc3);
    this.crossTable.columnConstraints.push(cc4);
    this.updateAllHeaderConstraints();
    console.log('crosstable: ', this.crossTable);
  }

  mockDataUpdate() {
    // generate the column-header rows
    // let numColDimColumns = this.columnConstraints.length > 0 ? 1 : 0;
    // for (let colIndex = 0; colIndex < this.columnConstraints.length; colIndex++) {
    //   let colConstraint: ConceptConstraint = this.columnConstraints[colIndex];
    //   numColDimColumns = numColDimColumns * colConstraint.values.length;
    //   let row = new Row();
    //
    //   // add empty space fillers on the top-left corner of the table
    //   for (let rowIndex = 0; rowIndex < this.rowDimensions.length; rowIndex++) {
    //     headerRow.cols.push(new Col('', Col.COLUMN_FIELD_PREFIX + (rowIndex + 1).toString()));
    //     row.addDatum('');
    //   }
    //
    //   // add the column header names
    //   let dimensionsAbove = this.getDimensionsAbove(colDim, this.columnDimensions);
    //   let selfRepetition = 1;
    //   for (let dimAbove of dimensionsAbove) {
    //     selfRepetition = selfRepetition * dimAbove.values.length;
    //   }
    //   let dimensionsBelow = this.getDimensionsBelow(colDim, this.columnDimensions);
    //   let valueRepetition = 1;
    //   for (let dimBelow of dimensionsBelow) {
    //     valueRepetition = valueRepetition * dimBelow.values.length;
    //   }
    //
    //   for (let i = 0; i < selfRepetition; i++) {
    //     for (let val of colDim.values) {
    //       for (let j = 0; j < valueRepetition; j++) {
    //         headerRow.cols.push(new Col(val.name, Col.COLUMN_FIELD_PREFIX + (headerRow.cols.length + 1).toString(),
    //           val.metadata));
    //         row.addDatum(val.name, val.metadata);
    //       }
    //     }
    //   }
    //   if (this.isUsingHeaders) {
    //     headerRows.push(headerRow);
    //   } else {
    //     this.rows.push(row);
    //   }
    // }
    // // generate the data rows
    // let dataRows = [];
    // let rowDim0 = this.rowDimensions[0];
    // // if there at least one row dimension
    // if (rowDim0) {
    //   let dimensionsRight0 = this.getDimensionsBelow(rowDim0, this.rowDimensions);
    //   let valueRepetition0 = 1;
    //   for (let dimRight of dimensionsRight0) {
    //     valueRepetition0 = valueRepetition0 * dimRight.values.length;
    //   }
    //   for (let val of rowDim0.values) {
    //     for (let j = 0; j < valueRepetition0; j++) {
    //       let row = new Row();
    //       row.addDatum(val.name, val.metadata);
    //       dataRows.push(row);
    //     }
    //   }
    //   let index = 0;
    //   for (let rowIndex = 1; rowIndex < this.rowDimensions.length; rowIndex++) {
    //     let rowDim = this.rowDimensions[rowIndex];
    //     let dimensionsLeft = this.getDimensionsAbove(rowDim, this.rowDimensions);
    //     let selfRepetition = 1;
    //     for (let dimLeft of dimensionsLeft) {
    //       selfRepetition = selfRepetition * dimLeft.values.length;
    //     }
    //     let dimensionsRight = this.getDimensionsBelow(rowDim, this.rowDimensions);
    //     let valueRepetition = 1;
    //     for (let dimRight of dimensionsRight) {
    //       valueRepetition = valueRepetition * dimRight.values.length;
    //     }
    //     for (let i = 0; i < selfRepetition; i++) {
    //       for (let val of rowDim.values) {
    //         for (let j = 0; j < valueRepetition; j++) {
    //           dataRows[index].addDatum(val.name, val.metadata);
    //           let nIndex = index + 1;
    //           index = (nIndex === dataRows.length) ? 0 : nIndex;
    //         }
    //       }
    //     }
    //   }
    // } else {// if there is no row dimension
    //   dataRows.push(new Row());
    // }
    // for (let dataRowIndex = 0; dataRowIndex < dataRows.length; dataRowIndex++) {
    //   let dataRow = dataRows[dataRowIndex];
    //   for (let i = 0; i < numColDimColumns; i++) {
    //     dataRow.addDatum('val');
    //   }
    //   if (numColDimColumns === 0) {
    //     dataRow.addDatum('val');
    //   }
    //   this.rows.push(dataRow);
    // }
    // // generate column headers
    // if (this.isUsingHeaders) {
    //   headerRows.forEach((headerRow: HeaderRow) => {
    //     let newColRow = new HeaderRow();
    //     headerRow.cols.forEach((col: Col) => {
    //       if (newColRow.cols.length > 0) {
    //         if (newColRow.cols[newColRow.cols.length - 1].header === col.header && col.header !== '') {
    //           newColRow.cols[newColRow.cols.length - 1].colspan += 1;
    //         } else {
    //           newColRow.cols.push(col)
    //         }
    //       } else {
    //         newColRow.cols.push(col)
    //       }
    //     });
    //     this.dataTable.headerRows.push(newColRow);
    //   });
    // } else {
    //   for (let field in this.rows[0].data) {
    //     let col = new Col(' - ', field, this.rows[0].metadata[field]);
    //     this.dataTable.cols.push(col);
    //   }
    // }
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
}
