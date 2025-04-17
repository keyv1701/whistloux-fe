import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable, of, throwError } from 'rxjs';
import { PlayerWhistBids } from '../../../models/bids/player-whist-bids.model';
import { environment } from '../../../../environments/environment';
import { WhistBidDetail } from "../../../models/bids/whist-bid-detail.model";
import { WhistBidsWeek } from "../../../models/bids/whist-bids-week.model";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class PlayerWhistBidsService {
  private apiUrl = `${environment.apiBaseUrl}/whist-bids`;

  constructor(private http: HttpClient) {
  }

  getBidsBySeason(season: string, from?: string, to?: string): Observable<PlayerWhistBids[]> {
    let params = new HttpParams();

    if (from) {
      params = params.set('dateFrom', from);
    }

    if (to) {
      params = params.set('dateTo', to);
    }

    return this.http.get<PlayerWhistBids[]>(`${this.apiUrl}/season/${season}`, {params});
  }

  getBidsByPlayer(playerUuid: string): Observable<PlayerWhistBids[]> {
    return this.http.get<PlayerWhistBids[]>(`${this.apiUrl}/player/${playerUuid}`);
  }

  getBidsByPlayerAndDate(playerUuid: string, season: string, date: string): Observable<WhistBidsWeek> {
    return this.http.get<WhistBidsWeek>(`${this.apiUrl}/player/${playerUuid}/season/${season}/date/${date}`);
  }

  getBidsBySeasonAndPlayer(season: string, playerUuid: string): Observable<PlayerWhistBids> {
    return this.http.get<PlayerWhistBids>(`${this.apiUrl}/season/${season}/player/${playerUuid}`);
  }

  createPlayerBids(playerWhistBids: PlayerWhistBids): Observable<PlayerWhistBids> {
    return this.http.post<PlayerWhistBids>(this.apiUrl, playerWhistBids);
  }

  updatePlayerBids(season: string, playerUuid: string, updatedBids: PlayerWhistBids): Observable<PlayerWhistBids> {
    return this.http.put<PlayerWhistBids>(`${this.apiUrl}/season/${season}/player/${playerUuid}`, updatedBids);
  }

  updatePlayerBidsWeek(season: string, playerUuid: string, weekDate: string, updatedWeek: WhistBidsWeek): Observable<PlayerWhistBids> {
    return this.http.put<PlayerWhistBids>(
      `${this.apiUrl}/season/${season}/player/${playerUuid}/week/${weekDate}`,
      updatedWeek
    );
  }

  deletePlayerBids(season: string, playerUuid: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/season/${season}/player/${playerUuid}`);
  }

  addBidDetail(season: string, playerUuid: string, bidDetail: WhistBidDetail): Observable<PlayerWhistBids> {
    return this.http.post<PlayerWhistBids>(`${this.apiUrl}/season/${season}/player/${playerUuid}/bid`, bidDetail);
  }

  exportSeasonBidsToExcel(season: string, from: string, to: string): Observable<Blob> {
    let params = new HttpParams();

    if (from) {
      params = params.set('dateFrom', from);
    }

    if (to) {
      params = params.set('dateTo', to);
    }

    return this.http.get(`${this.apiUrl}/season/${season}/export/excel`, {
      responseType: 'blob',
      params: params
    });
  }

  importSeasonBidsFromExcel(season: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(`${this.apiUrl}/season/${season}/import/excel`, formData);
  }

  getLastFinalizedDate(season: string): Observable<Date | null> {
    return this.http.get<string>(`${this.apiUrl}/last-finalized-date/${season}`, {
      responseType: 'text' as 'json'
    }).pipe(
      map(dateStr => dateStr ? new Date(dateStr) : null),
      catchError(error => {
        // Gestion du cas 204 No Content
        if (error.status === 204) {
          return of(null);
        }
        return throwError(() => error);
      })
    );
  }
}
