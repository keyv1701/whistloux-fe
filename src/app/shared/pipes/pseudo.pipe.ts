import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pseudo',
  standalone: true
})
export class PseudoPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';

    return value
      .split(' ')
      .map(word => {
        if (word.length === 0) return '';
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  }
}
