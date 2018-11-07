import {Injectable} from '@angular/core';
import {AuthenticationService} from './authentication/authentication.service';
import * as fjs from 'fractalis';
import {MessageHelper} from '../utilities/message-helper';
import {ChartType} from '../models/chart-models/chart-type';
import {Chart} from '../models/chart-models/chart';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FractalisService {

  public fractalis: any;
  private _availableChartTypes: ChartType[] = [];
  private _selectedChartType: ChartType = null;
  private _charts: Chart[] = [];
  private _chartAdded: Subject<Chart> = new Subject<Chart>();

  constructor(private authService: AuthenticationService) {
    let token = this.authService.token;
    // TODO: dynamically get the endpoints
    const config = {
      handler: 'transmart',
      dataSource: 'http://192.168.178.24:8081',
      fractalisNode: 'http://localhost',
      getAuth() {
        return {token: token}
      },
      options: {
        controlPanelPosition: 'right',
        controlPanelExpanded: true,
        showDataBox: true
      }
    };

    const constraint = {
      type: 'concept',
      conceptCode: 'O1KP:NUM1'
    }
    const descriptor = {
      constraint: JSON.stringify(constraint),
      data_type: 'numerical',
      label: 'This is a test'
    };

    if (fjs.fractalis) {
      this.fractalis = fjs.fractalis.init(config);
      console.log('Fratalis imported: ', this.availableChartTypes);

      this.fractalis.loadData([descriptor])
        .then(res => {
          console.log('response here', res);
        })
        .catch(err => {
          console.log('cannot load data: ');
          console.log(err)
        });
      this.retrieveAvailableChartTypes();

    } else {
      MessageHelper.alert('error', 'Fail to import Fractalis.');
    }
  }

  private retrieveAvailableChartTypes() {
    let fChartTypes: string[] = this.fractalis.getAvailableCharts();
    let chartTypes = [];
    fChartTypes.forEach((t: string) => {
      chartTypes.push(<ChartType>t.toLowerCase());
    });
    chartTypes.push(ChartType.CROSSTABLE);
    this.availableChartTypes = chartTypes;
  }

  public addChart() {
    if (this.selectedChartType) {
      let chart = new Chart(this.selectedChartType);
      this.charts.push(chart);
      this.chartAdded.next(chart);
    }
  }

  public removeChart(chart: Chart) {
    this.charts.splice(this.charts.indexOf(chart), 1);
  }

  get availableChartTypes(): ChartType[] {
    return this._availableChartTypes;
  }

  set availableChartTypes(value: ChartType[]) {
    this._availableChartTypes = value;
  }

  get selectedChartType(): ChartType {
    return this._selectedChartType;
  }

  set selectedChartType(value: ChartType) {
    this._selectedChartType = value;
  }

  get charts(): Chart[] {
    return this._charts;
  }

  set charts(value: Chart[]) {
    this._charts = value;
  }

  get chartAdded(): Subject<Chart> {
    return this._chartAdded;
  }

  set chartAdded(value: Subject<Chart>) {
    this._chartAdded = value;
  }

}
