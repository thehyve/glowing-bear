import { BreakdownType } from './breakdown-type';


export class QueryBreakdown {
  private breakdowns: { [id: string]: { breakdownType: BreakdownType, selected: boolean } }

  constructor() {
    this.breakdowns = {}



    BreakdownType.AVAILABLE.forEach(function (qtype: BreakdownType): void {

      this.breakdowns[qtype.name] = { breakdownType: qtype, selected: false }
    }.bind(this))
  }
  change(id: string) {
    this.breakdowns[id].selected = !this.breakdowns[id].selected
  }
  retrieve(id: string): { breakdownType: BreakdownType, selected: boolean } {
    return this.breakdowns[id]
  }
}
