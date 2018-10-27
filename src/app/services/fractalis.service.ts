import {Injectable} from '@angular/core';
import {AuthenticationService} from './authentication/authentication.service';
import * as fjs from 'fractalis';
import {MessageHelper} from '../utilities/message-helper';
import {ChartType} from '../models/chart-models/chart-type';

@Injectable({
  providedIn: 'root'
})
export class FractalisService {

  public fractalis: any;

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

    } else {
      MessageHelper.alert('error', 'Fail to import Fractalis.');
    }
  }

  get availableChartTypes(): ChartType[] {
    let fChartTypes: string[] = this.fractalis.getAvailableCharts();
    let chartTypes = [];
    fChartTypes.forEach((t: string) => {
      chartTypes.push(<ChartType>t.toLowerCase());
    });
    chartTypes.push(ChartType.CROSSTABLE);
    return chartTypes;
  }
}
