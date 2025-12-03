import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'unionNombreApellido',
})
export class UnionNombreApellidoPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    let concatenado = value[0].toUpperCase() + ', ' + value[1].toUpperCase();
    return concatenado;
  }
}
