// src/app/core/services/championship/championship.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ChampionshipWeek } from "../../../models/championship/championship-week.model";
import { PlayerWeekScore } from "../../../models/championship/player-week-score.model";
import {PlayerRanking} from "../../../models/championship/player-ranking.model";

@Injectable({
  providedIn: 'root'
})
export class ChampionshipService {
  private apiUrl = `${environment.apiBaseUrl}/championship`;

  constructor(private http: HttpClient) {
  }

  // Récupérer toutes les semaines de championnat
  getChampionshipWeeks(): Observable<ChampionshipWeek[]> {
    return this.http.get<ChampionshipWeek[]>(this.apiUrl);
  }

  // Récupérer une semaine de championnat par son UUID
  getChampionshipWeek(uuid: string): Observable<ChampionshipWeek> {
    return this.http.get<ChampionshipWeek>(`${this.apiUrl}/weeks/${uuid}`);
  }

  // Récupérer les semaines d'une saison spécifique
  getChampionshipWeeksBySeason(season: string): Observable<ChampionshipWeek[]> {
    return this.http.get<ChampionshipWeek[]>(`${this.apiUrl}/season/${season}`);
  }

  // Créer une nouvelle semaine de championnat
  createChampionshipWeek(week: ChampionshipWeek): Observable<ChampionshipWeek> {
    return this.http.post<ChampionshipWeek>(`${this.apiUrl}/weeks`, week);
  }

  // Mettre à jour une semaine de championnat
  updateChampionshipWeek(week: ChampionshipWeek): Observable<ChampionshipWeek> {
    return this.http.put<ChampionshipWeek>(`${this.apiUrl}/${week.uuid}`, week);
  }

  // Supprimer une semaine de championnat
  deleteChampionshipWeek(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${uuid}`);
  }

  // Ajouter un score de joueur à une semaine
  addPlayerScore(weekUuid: string, playerScore: PlayerWeekScore): Observable<PlayerWeekScore> {
    return this.http.post<PlayerWeekScore>(`${this.apiUrl}/${weekUuid}/scores`, playerScore);
  }

  // Mettre à jour un score de joueur
  updatePlayerScore(weekUuid: string, playerScore: PlayerWeekScore): Observable<PlayerWeekScore> {
    return this.http.put<PlayerWeekScore>(`${this.apiUrl}/${weekUuid}/scores/${playerScore.uuid}`, playerScore);
  }

  // Supprimer un score de joueur
  deletePlayerScore(weekUuid: string, playerScoreUuid: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${weekUuid}/scores/${playerScoreUuid}`);
  }

  // Récupérer toutes les semaines avec filtre de saison optionnel
  getAllWeeksBySeason(season?: string): Observable<ChampionshipWeek[]> {
    let url = `${this.apiUrl}/weeks`;
    if (season) {
      url += `?season=${season}`;
    }
    return this.http.get<ChampionshipWeek[]>(url);
  }

  getAllWeeks(): Observable<ChampionshipWeek[]> {
    const url = `${this.apiUrl}/weeks`;
    return this.http.get<ChampionshipWeek[]>(url);
  }

  exportChampionshipToExcel(weekUuid: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/weeks/${weekUuid}/export/excel`, {
      responseType: 'blob'
    });
  }

  importChampionshipFromExcel(weekUuid: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(
      `${this.apiUrl}/weeks/${weekUuid}/import/excel`,
      formData
    );
  }

  getChampionshipRankings(season: string): Observable<PlayerRanking[]> {
    return this.http.get<PlayerRanking[]>(`${this.apiUrl}/championship/rankings/${season}`);
  }
}
