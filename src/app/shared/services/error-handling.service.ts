import {Injectable} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {ToastService} from "./toast.service";

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {

  constructor(private toastService: ToastService) {
  }

  /**
   * Traite une erreur HTTP et affiche un message approprié
   * @param error L'erreur HTTP à traiter
   * @param defaultMessage Message par défaut si l'erreur ne contient pas de message spécifique
   * @returns Le message d'erreur extrait
   */
  handleHttpError(error: HttpErrorResponse, defaultMessage: string): string {
    let errorData = error.error;
    let errorMessage = defaultMessage;

    // Tenter de parser l'erreur si c'est une chaîne JSON
    if (typeof errorData === 'string' && errorData.startsWith('{')) {
      try {
        errorData = JSON.parse(errorData);
      } catch (e) {
        console.error('Impossible de parser l\'erreur JSON:', e);
      }
    }

    // Extraire le message d'erreur s'il existe
    if (errorData?.message) {
      errorMessage = errorData.message;
    }

    // Afficher le message d'erreur
    this.toastService.error(errorMessage);

    return errorMessage;
  }
}
