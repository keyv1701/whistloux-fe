// src/app/services/tournament.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from "../../../../environments/environment";
import { TournamentModel } from "../../../models/tournament/tournament.model";
import { TournamentRegistrationMail } from "../../../models/tournament/tournament-registration-mail.interface";

@Injectable({
  providedIn: 'root'
})
export class TournamentService {
  private apiUrl = `${environment.apiBaseUrl}/tournaments`;

  constructor(private http: HttpClient) {
  }

  getAllTournaments(): Observable<TournamentModel[]> {
    return this.http.get<TournamentModel[]>(this.apiUrl);
  }

  getTournamentByUuid(uuid: string): Observable<TournamentModel> {
    return this.http.get<TournamentModel>(`${this.apiUrl}/${uuid}`);
  }

  createTournament(tournament: TournamentModel): Observable<TournamentModel> {
    return this.http.post<TournamentModel>(this.apiUrl, tournament);
  }

  updateTournament(tournament: TournamentModel): Observable<TournamentModel> {
    return this.http.put<TournamentModel>(`${this.apiUrl}/${tournament.uuid}`, tournament);
  }

  deleteTournament(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${uuid}`);
  }

  sendRegistrationMail(registrationData: TournamentRegistrationMail): Observable<TournamentRegistrationMail> {
    return this.http.post<TournamentRegistrationMail>(`${this.apiUrl}/register/mail`, registrationData);
  }
}
