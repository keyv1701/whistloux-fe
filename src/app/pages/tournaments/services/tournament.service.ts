// src/app/services/tournament.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "../../../../environments/environment";
import { Tournament } from "../../../models/tournament/tournament";
import { TournamentRegistrationMail } from "../../../models/tournament/tournament-registration-mail.interface";

@Injectable({
  providedIn: 'root'
})
export class TournamentService {
  private apiUrl = `${environment.apiBaseUrl}/tournaments`;

  constructor(private http: HttpClient) {
  }

  getAllTournaments(): Observable<Tournament[]> {
    return this.http.get<Tournament[]>(this.apiUrl);
  }

  getTournamentByUuid(uuid: string): Observable<Tournament> {
    return this.http.get<Tournament>(`${this.apiUrl}/${uuid}`);
  }

  createTournament(tournament: Tournament): Observable<Tournament> {
    return this.http.post<Tournament>(this.apiUrl, tournament);
  }

  updateTournament(tournament: Tournament): Observable<Tournament> {
    return this.http.put<Tournament>(`${this.apiUrl}/${tournament.uuid}`, tournament);
  }

  deleteTournament(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${uuid}`);
  }

  sendRegistrationMail(registrationData: TournamentRegistrationMail): Observable<TournamentRegistrationMail> {
    return this.http.post<TournamentRegistrationMail>(`${this.apiUrl}/register/mail`, registrationData);
  }
}
