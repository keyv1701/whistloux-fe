import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nullToEmpty',
  standalone: true
})
export class NullToEmptyPipe implements PipeTransform {
  transform<T>(value: T[] | null): T[] {
    return value || [];
  }
}
