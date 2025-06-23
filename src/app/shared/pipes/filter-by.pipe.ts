import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterBy',
  standalone: true,
})
export class FilterByPipe implements PipeTransform {
  transform<T, K extends keyof T>(items: T[], property: K, value: T[K]): T[] {
    if (!items || !property) {
      return items;
    }

    return items.filter((item) => item[property] === value);
  }
}
