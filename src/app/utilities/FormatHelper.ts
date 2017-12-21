export class FormatHelper {

  public static formatNumber(x: number): string {
    if (x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    } else {
      return '0';
    }
  }

  public static percentage(part: number, total: number): string {
    if (total === null || total === 0) {
      return '';
    } else {
      let perc = part ? (part / total) * 100 : 0;
      return `(${perc.toFixed(0)}%)`;
    }
  }
}
