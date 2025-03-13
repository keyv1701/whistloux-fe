import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PlayerWhistBidsFacade } from '../../facades/player-whist-bids.facade';
import { PlayerWhistBids } from '../../../../models/bids/player-whist-bids.model';
import {WhistBid, getBidDescription, WhistBidPoints} from "../../../../models/bids/whist-bid.enum";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {ImportModalComponent} from "../../../../shared/components/import-modal/import-modal.component";
import {ToastService} from "../../../../shared/services/toast.service";

@Component({
  selector: 'app-player-whist-bids-list-page',
  templateUrl: './player-whist-bids-list-page.component.html',
  styleUrls: ['./player-whist-bids-list-page.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ImportModalComponent
  ]
})
export class PlayerWhistBidsListPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  playerBids: PlayerWhistBids[] = [];
  loading = false;
  error: string | null = null;
  currentSeason = '2025';

  filterForm: FormGroup;
  seasons: string[] = [];
  protected readonly WhistBid = WhistBid;
  selectedPlayerUuid: string | null = null; // Ajout de cette propriété

  showImportDialog = false;

  constructor(
    private fb: FormBuilder,
    private playerWhistBidsFacade: PlayerWhistBidsFacade,
    private toastService: ToastService
  ) {
    this.filterForm = this.fb.group({
      season: [new Date().getFullYear().toString()],
      player: [null] // Ajout d'un contrôle pour sélectionner un joueur
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
      .subscribe(error => {
        this.error = error;
        if (error) {
          this.toastService.error(error);
        }
      });

    // Charger les données pour la saison actuelle
    this.loadBidsBySeason(this.filterForm.get('season')?.value);

    // Écouter les changements de saison
    this.filterForm.get('season')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(season => this.loadBidsBySeason(season));

    // Écouter les changements de joueur sélectionné
    this.filterForm.get('player')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(player => this.selectedPlayerUuid = player);
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

  exportToExcel(): void {
    this.playerWhistBidsFacade.exportSeasonBidsToExcel(this.currentSeason).subscribe();
  }

  openImportDialog(): void {
    this.showImportDialog = true;
  }

  closeImportDialog(): void {
    this.showImportDialog = false;
  }

  importData(file: File): void {
    const currentSeason = this.filterForm.get('season')?.value;
    if (currentSeason) {
      this.playerWhistBidsFacade.importSeasonBidsFromExcel(currentSeason, file).subscribe({
        next: (response) => {
          this.toastService.success(
            `Importation réussie !`
          );
        },
        error: (error) => {
          this.toastService.error(
            `Erreur lors de l'importation : ${error.error?.message || 'Une erreur est survenue'}`
          );
        }
      });
    } else {
      this.toastService.error('Veuillez sélectionner une saison pour importer des données.');
    }
    this.closeImportDialog();
  }

  protected readonly WhistBidPoints = WhistBidPoints;
}
