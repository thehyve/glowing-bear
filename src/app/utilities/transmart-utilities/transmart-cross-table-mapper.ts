import {TransmartCrossTable} from '../../models/transmart-models/transmart-cross-table';
import {Row} from '../../models/table-models/row';
import {CrossTable} from '../../models/table-models/cross-table';
import {Col} from '../../models/table-models/col';

export class TransmartCrossTableMapper {

  /**
   * Maps cross table response data to the crosst table object that is passed
   * as a parameter.
   *
   * @param {TransmartCrossTable} tmCrossTable
   * @param {CrossTable} crossTable
   * @return {CrossTable}
   */
  public static mapTransmartCrossTable(tmCrossTable: TransmartCrossTable,
                                       crossTable: CrossTable): CrossTable {
    const matrix = tmCrossTable.rows;

    crossTable.rows = [];
    crossTable.cols = [];
    // add top rows
    let colHeaders = crossTable.columnHeaderConstraints;
    for (let i = 0; i < crossTable.columnConstraints.length; i++) {
      let row = new Row();
      // add blanks
      for (let rowCon of crossTable.rowConstraints) {
        row.addDatumObject({
          isHeader: false,
          value: ''
        })
      }
      // add col headers
      for (let colHeader of colHeaders) {
        row.addDatumObject({
          isHeader: true,
          value: colHeader[i].textRepresentation
        });
      }
      crossTable.rows.push(row);
    }
    // add data rows
    let rowHeaders = crossTable.rowHeaderConstraints;
    for (let i = 0; i < rowHeaders.length; i++) {
      let row = new Row();
      rowHeaders[i].forEach(constraint => {
        row.addDatumObject({
          isHeader: true,
          value: constraint.textRepresentation
        })
      });
      for (let j = 0; j < colHeaders.length; j++) {
        row.addDatumObject({
          isHeader: false,
          value: matrix[i][j]
        })
      }
      crossTable.rows.push(row);
    }
    // add the cols serving as indices for rows
    for (let field in crossTable.rows[0].data) {
      let col = new Col(' - ', field);
      crossTable.cols.push(col);
    }

    return crossTable;
  }

}
