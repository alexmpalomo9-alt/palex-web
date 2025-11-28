import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'booleanToText',
})
export class BooleanToTextPipe implements PipeTransform {
  transform(ValorBooleano: boolean, ...args: any[]): string {
    return ValorBooleano ? args[0] : args[1];
  }
}
