import * as moment from 'moment';
import Diff = moment.unitOfTime.Diff;

export class FormatHelper {

  public static readonly nullValuePlaceholder: string = 'MISSING';

  static readonly timeUnits: Diff[] = ['year', 'month', 'day', 'hour', 'minute', 'second'];

  public static formatCountNumber(x: number): string {
    if (typeof(x) === 'number') {
      if (x > -1) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      } else {
        return '...';
      }
    } else {
      return '...';
    }
  }

  public static formatDateSemantics(t: Date): string {
    let t1 = moment(Date.now());
    let t2 = moment(t);
    let past = t2.isBefore(t1);
    for (let i = 0; i < this.timeUnits.length; i++) {
      let unit = this.timeUnits[i];
      let diff = Math.abs(Math.round(t1.diff(t2, unit)));
      if (diff > 0) {
        return `${past ? '' : 'in '}${diff} ${unit}${diff > 1 ? 's' : ''}${past ? ' ago' : ''}`;
      }
    }
    return 'now';
  }

  public static percentage(part: number, total: number): string {
    if (total === null || total === 0 || part === null || part < 0) {
      return '';
    } else {
      let perc = part ? (part / total) * 100 : 0;
      return `(${perc.toFixed(0)}%)`;
    }
  }

  public static formatMetadata(metadata: Map<string, string>): string {
    let metadataText = '';
    metadata.forEach((value, key) => {
      metadataText += key + ': ' + value + '\n';
    });
    return metadataText;
  }

}
