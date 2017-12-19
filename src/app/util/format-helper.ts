import { Injectable } from '@angular/core';

@Injectable()
export class FormatHelper {

    public static singularOrPlural(noun: string, number: string) {
        if (number === '1' || number === '0') {
            return noun;
        } else if (noun === 'study') {
            return 'studies';
        } else {
            return noun + 's';
        }
    }

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
