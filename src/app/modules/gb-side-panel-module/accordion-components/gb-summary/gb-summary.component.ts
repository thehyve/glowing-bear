import {Component, OnInit} from '@angular/core';
import {QueryService} from '../../../../services/query.service';

@Component({
  selector: 'gb-summary',
  templateUrl: './gb-summary.component.html',
  styleUrls: ['./gb-summary.component.css']
})
export class GbSummaryComponent implements OnInit {

  constructor(private queryService: QueryService) {
  }

  ngOnInit() {
  }

  get subjectCount(): number {
    return this.queryService.subjectCount_2;
  }

}
