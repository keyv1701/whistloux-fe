// src/app/services/player.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Player } from "../../../models/players/player.interface";
import { environment } from "../../../../environments/environment";
import { PlayerLight } from "../../../models/players/player-light.interface";

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private apiUrl = `${environment.apiBaseUrl}/players`;

  constructor(private http: HttpClient) {
  }

  getPlayerPseudos(): Observable<PlayerLight[]> {
    return this.http.get<PlayerLight[]>(`${this.apiUrl}/pseudos`);
  }

  getActivePlayerPseudos(): Observable<PlayerLight[]> {
    return this.http.get<PlayerLight[]>(`${this.apiUrl}/pseudos/active`);
  }

  getPlayers(): Observable<Player[]> {
    return this.http.get<Player[]>(this.apiUrl);
  }

  getPlayerByUuid(uuid: string): Observable<Player> {
    return this.http.get<Player>(`${this.apiUrl}/${uuid}`);
  }

  createPlayer(player: Player): Observable<Player> {
    return this.http.post<Player>(this.apiUrl, player);
  }

  updatePlayer(player: Player): Observable<Player> {
    return this.http.put<Player>(`${this.apiUrl}/${player.uuid}`, player);
  }

  deletePlayer(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${uuid}`);
  }

  exportPlayersToExcel(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/excel`, {
      responseType: 'blob'
    });
  }

  importPlayersFromExcel(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<string>(`${this.apiUrl}/import/excel`, formData, {
      responseType: 'text' as 'json'
    });
  }
}
