import {Component, OnInit} from '@angular/core';
import {TableService} from '../../../../services/table.service';
import {Row} from '../../../../models/table-models/row';
import {HeaderRow} from '../../../../models/table-models/header-row';
import {Col} from '../../../../models/table-models/col';

@Component({
  selector: 'gb-table-grid',
  templateUrl: './gb-table-grid.component.html',
  styleUrls: ['./gb-table-grid.component.css']
})
export class GbTableGridComponent implements OnInit {

  constructor(private tableService: TableService) {
  }

  ngOnInit() {
  }

  get rows(): Row[] {
    return this.tableService.rows;
  }

  get cols(): Col[] {
    if (this.tableService.isUsingHeaders) {
      if (this.tableService.headerRows.length > 0) {
        return this.tableService.headerRows[this.tableService.headerRows.length - 1].cols;
      } else {
        return [];
      }
    } else {
      return this.tableService.cols;
    }
  }

  get isUsingHeaders(): boolean {
    return this.tableService.isUsingHeaders;
  }

  get headerRows(): HeaderRow[] {
    return this.tableService.headerRows;
  }

  get currentPage(): number {
    return this.tableService.dataTable.currentPage;
  }

  nextPage() {
    this.tableService.nextPage();
  }

  previousPage() {
    this.tableService.previousPage();
  }
}
