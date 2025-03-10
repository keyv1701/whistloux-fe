import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PlayerWhistBids } from '../../../models/bids/player-whist-bids.model';
import { environment } from '../../../../environments/environment';
import {WhistBidDetail} from "../../../models/bids/whist-bid-detail.model";

@Injectable({
  providedIn: 'root'
})
export class PlayerWhistBidsService {
  private apiUrl = `${environment.apiBaseUrl}/whist-bids`;

  constructor(private http: HttpClient) { }

  getBidsBySeason(season: string): Observable<PlayerWhistBids[]> {
    return this.http.get<PlayerWhistBids[]>(`${this.apiUrl}/season/${season}`);
  }

  getBidsByPlayer(playerUuid: string): Observable<PlayerWhistBids[]> {
    return this.http.get<PlayerWhistBids[]>(`${this.apiUrl}/player/${playerUuid}`);
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

  deletePlayerBids(season: string, playerUuid: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/season/${season}/player/${playerUuid}`);
  }

  addBidDetail(season: string, playerUuid: string, bidDetail: WhistBidDetail): Observable<PlayerWhistBids> {
    return this.http.post<PlayerWhistBids>(`${this.apiUrl}/season/${season}/player/${playerUuid}/bid`, bidDetail);
  }
}
