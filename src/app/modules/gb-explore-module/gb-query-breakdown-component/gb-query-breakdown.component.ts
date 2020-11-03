import { Component, OnInit } from '@angular/core';


import { BreakdownType } from 'app/models/breakdown-models/breakdown-type';
import { QueryBreakdownService } from 'app/services/query-breakdown.service';
import { QueryBreakdown } from 'app/models/breakdown-models/breakdown';
import { OverlayPanel } from 'primeng/components/overlaypanel/overlaypanel';



@Component({
  selector: 'app-gb-query-breakdown',
  templateUrl: './gb-query-breakdown.component.html',
  styleUrls: ['./gb-query-breakdown.component.css']
})
export class GbQueryBreakdownComponent implements OnInit {

  public breakdownSelection: { id: string, name: string, selected: boolean }[]

  constructor(private queryBreakdownService: QueryBreakdownService) {
    this.breakdownSelection = BreakdownType.AVAILABLE.map(btype => { return { id: btype.id, name: btype.name, selected: queryBreakdownService.retrieve[btype.id] } })
  }

  ngOnInit() {
  }



}



class BreakdownSelection {
  constructor(private queryBreakdownService: QueryBreakdownService, public readonly id: string, public readonly name: string, private selected: boolean) {

  }

  get status(): boolean {
    return this.selected
  }

  changeBreakdownType() {
    this.queryBreakdownService.change(this.id)
    this.selected = this.selected
  }
}
