import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PlayerWhistBidsFacade } from '../../facades/player-whist-bids.facade';
import { PlayerWhistBids } from '../../../../models/bids/player-whist-bids.model';
import { WhistBid, getBidDescription } from "../../../../models/bids/whist-bid.enum";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-player-whist-bids-list-page',
  templateUrl: './player-whist-bids-list-page.component.html',
  styleUrls: ['./player-whist-bids-list-page.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ]
})
export class PlayerWhistBidsListPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  playerBids: PlayerWhistBids[] = [];
  loading = false;
  error: string | null = null;

  filterForm: FormGroup;
  seasons: string[] = [];
  protected readonly WhistBid = WhistBid;

  constructor(
    private fb: FormBuilder,
    private playerWhistBidsFacade: PlayerWhistBidsFacade
  ) {
    this.filterForm = this.fb.group({
      season: [new Date().getFullYear().toString()]
    });

    // Créer les options pour les 5 dernières années
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      this.seasons.push((currentYear - i).toString());
    }
  }

  ngOnInit(): void {
    // S'abonner aux données des enchères
    this.playerWhistBidsFacade.playerBids$
      .pipe(takeUntil(this.destroy$))
      .subscribe(bids => this.playerBids = bids);

    // S'abonner à l'état de chargement
    this.playerWhistBidsFacade.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    // S'abonner aux erreurs
    this.playerWhistBidsFacade.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => this.error = error);

    // Charger les données pour la saison actuelle
    this.loadBidsBySeason(this.filterForm.get('season')?.value);

    // Écouter les changements de saison
    this.filterForm.get('season')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(season => this.loadBidsBySeason(season));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBidsBySeason(season: string): void {
    this.playerWhistBidsFacade.loadBidsBySeason(season);
  }

  getBidDescription(bidType: WhistBid): string {
    return getBidDescription(bidType);
  }

  // Calcule le nombre total d'enchères pour un joueur
  getTotalBids(playerBids: PlayerWhistBids): number {
    return playerBids.bidDetails.reduce((total, bid) => total + bid.count, 0);
  }

  // Calcule le nombre d'enchères d'un type spécifique pour un joueur
  getBidTypeCount(playerBids: PlayerWhistBids, bidType: WhistBid): number {
    const bidDetail = playerBids.bidDetails.find(detail => detail.bidType === bidType);
    return bidDetail ? bidDetail.count : 0;
  }
}
