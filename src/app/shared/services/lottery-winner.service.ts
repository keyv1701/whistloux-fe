import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LotteryWinner } from "../../models/lottery-winner/lottery-winner.model";

@Injectable({
  providedIn: 'root'
})
export class LotteryWinnerService {
  private apiUrl = `${environment.apiBaseUrl}/lottery/winners`;

  constructor(private http: HttpClient) {
  }

  getAllWinners(): Observable<LotteryWinner[]> {
    return this.http.get<LotteryWinner[]>(this.apiUrl);
  }

  getWinnersBySeason(season: string): Observable<LotteryWinner[]> {
    return this.http.get<LotteryWinner[]>(`${this.apiUrl}/season/${season}`);
  }

  getWinnersBySeasonAndMonth(season: string, monthNumber: number): Observable<LotteryWinner[]> {
    return this.http.get<LotteryWinner[]>(`${this.apiUrl}/season/${season}/month/${monthNumber}`);
  }

  getWinnerByUuid(uuid: string): Observable<LotteryWinner> {
    return this.http.get<LotteryWinner>(`${this.apiUrl}/${uuid}`);
  }

  createWinner(winner: LotteryWinner): Observable<LotteryWinner> {
    return this.http.post<LotteryWinner>(this.apiUrl, winner);
  }

  updateWinner(winner: LotteryWinner): Observable<LotteryWinner> {
    return this.http.put<LotteryWinner>(this.apiUrl, winner);
  }

  deleteWinner(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${uuid}`);
  }
}
