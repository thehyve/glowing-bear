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

  get cols(): Array<Col> {
    let cols = [];
    if (this.tableService.headerRows && this.tableService.headerRows.length > 0) {
      this.tableService.headerRows[this.tableService.headerRows.length - 1].cols.forEach(
        col => {
          cols.push(col);
        });
    }
    return cols;
  }

  get headerRows(): HeaderRow[] {
    return this.tableService.headerRows;
  }

  nextPage() {
    this.tableService.nextPage();
  }

  previousPage() {
    this.tableService.previousPage();
  }

  get currentPage(): number {
    return this.tableService.currentPage;
  }

  getMetadataValues(map): string {
    let metadataText = '';
    map.forEach((value, key) => {
      metadataText += key + ': ' + value + '\n';
    });
    return metadataText;
  }
}
