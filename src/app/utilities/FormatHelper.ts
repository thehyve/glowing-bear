export class FormatHelper {

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

  public static formatDateSemantics(s: string): string {
    const then = new Date(s);
    const now = new Date();
    // difference in seconds
    let diff = (now.getTime() - then.getTime()) / 1000;
    let unit = 'seconds';
    if (diff >= 60) {
      // difference in minutes
      diff = diff / 60;
      unit = 'minutes';
      if (diff >= 60) {
        // difference in hours
        diff = diff / 60;
        unit = 'hours';
        if (diff >= 24) {
          // difference in days
          diff = diff / 24;
          unit = 'days';
          if (diff >= 7) {
            // difference in weeks
            diff = diff / 7;
            unit = 'weeks';
            if (diff >= 4) {
              // difference in months
              diff = diff / 4;
              unit = 'months';
              if (diff >= 12) {
                diff = diff / 12;
                unit = 'years';
              }
            }
          }
        }
      }
    }
    diff = Math.floor(diff);
    if (diff === 0 || diff === 1) {
      unit = unit.substring(0, unit.length - 1);
    }
    return diff + ' ' + unit + ' ago';
  }

  public static percentage(part: number, total: number): string {
    if (total === null || total === 0 || part < 0) {
      return '';
    } else {
      let perc = part ? (part / total) * 100 : 0;
      return `(${perc.toFixed(0)}%)`;
    }
  }

}
