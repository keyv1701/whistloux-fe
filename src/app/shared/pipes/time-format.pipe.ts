// src/app/shared/pipes/time-format.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat',
  standalone: true
})
export class TimeFormatPipe implements PipeTransform {
  transform(time: string | null | undefined): string {
    if (!time) return '';

    // Si c'est au format hh:mm, convertir en hh'h'mm
    if (/^\d{1,2}:\d{2}$/.test(time)) {
      const [hours, minutes] = time.split(':');
      return `${hours}h${minutes}`;
    }

    // Si c'est au format hh:mm:ss, retirer les secondes et convertir en hh'h'mm
    if (/^\d{1,2}:\d{2}:\d{2}$/.test(time)) {
      const timeWithoutSeconds = time.substring(0, 5);
      const [hours, minutes] = timeWithoutSeconds.split(':');
      return `${hours}h${minutes}`;
    }

    return time; // Retourner la valeur d'origine si format non reconnu
  }
}
