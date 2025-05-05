import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterBy',
  standalone: true
})
export class FilterByPipe implements PipeTransform {
  transform<T>(items: T[], property: keyof T, value: any): T[] {
    if (!items || !property) {
      return items;
    }

    return items.filter(item => item[property] === value);
  }
}
