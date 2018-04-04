import {Component, OnInit} from '@angular/core';
import {TableService} from '../../../../services/table.service';
import {Row} from '../../../../models/table-models/row';
import {HeaderRow} from "../../../../models/table-models/header-row";
import {Col} from "../../../../models/table-models/col";

@Component({
  selector: 'gb-table-grid',
  templateUrl: './gb-table-grid.component.html',
  styleUrls: ['./gb-table-grid.component.css']
})
export class GbTableTableComponent implements OnInit {

  constructor(private tableService: TableService) {
  }

  ngOnInit() {
  }

  get rows(): Row[] {
    return this.tableService.rows;
  }

  get cols(): Array<Col> {
    let cols =[];
    this.tableService.headerRows[this.tableService.headerRows.length - 1].cols.forEach(
      col => {
        cols.push(col);
      });
    return cols;
  }

  get headerRows(): HeaderRow[] {
    return this.tableService.headerRows;
  }
}
