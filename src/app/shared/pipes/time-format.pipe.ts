// src/app/shared/pipes/time-format.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat',
  standalone: true
})
export class TimeFormatPipe implements PipeTransform {
  transform(time: string | null | undefined): string {
    if (!time) return '';

    // Si c'est déjà au format hh:mm, retourner tel quel
    if (/^\d{1,2}:\d{2}$/.test(time)) {
      return time;
    }

    // Si c'est au format hh:mm:ss, retirer les secondes
    if (/^\d{1,2}:\d{2}:\d{2}$/.test(time)) {
      return time.substring(0, 5);
    }

    return time; // Retourner la valeur d'origine si format non reconnu
  }
}
