import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EMPTY, Subject } from 'rxjs';
import { catchError, finalize, takeUntil, tap } from 'rxjs/operators';
import { PlayerWhistBidsFacade } from '../../facades/player-whist-bids.facade';
import { PlayerWhistBids } from '../../../../models/bids/player-whist-bids.model';
import { getBidDescription, WhistBid, WhistBidPoints } from "../../../../models/bids/whist-bid.enum";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ImportModalComponent } from "../../../../shared/components/import-modal/import-modal.component";
import { ToastService } from "../../../../shared/services/toast.service";

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
  filteredPlayerBids: PlayerWhistBids[] = [];
  paginatedPlayerBids: PlayerWhistBids[] = [];

  // Propriétés pour la pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  // Propriétés pour le tri
  sortColumn: string = 'playerName';
  sortDirection: 'asc' | 'desc' = 'asc';

  loading = false;
  error: string | null = null;
  currentSeason = '2025';

  filterForm: FormGroup;
  seasons: string[] = [];
  protected readonly WhistBid = WhistBid;
  selectedPlayerUuid: string | null = null;

  showImportDialog = false;

  constructor(
    private fb: FormBuilder,
    private playerWhistBidsFacade: PlayerWhistBidsFacade,
    private toastService: ToastService
  ) {
    this.filterForm = this.fb.group({
      season: [new Date().getFullYear().toString()],
      player: [null],
      search: [''] // Ajout du contrôle de recherche
    });

    // Créer les options pour les 5 dernières années
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      this.seasons.push((currentYear - i).toString());
    }
  }

  ngOnInit(): void {
    // S'abonner aux données des annonces
    this.playerWhistBidsFacade.playerBids$
      .pipe(
        takeUntil(this.destroy$),
        tap(bids => {
          this.playerBids = bids;
          // Initialiser le tri par défaut sur totalBids en descendant
          this.sortColumn = 'totalBids';
          this.sortDirection = 'desc';
          this.applyFilters();
        })
      )
      .subscribe();

    // S'abonner à l'état de chargement
    this.playerWhistBidsFacade.loading$
      .pipe(
        takeUntil(this.destroy$),
        tap(loading => this.loading = loading)
      )
      .subscribe();

    // S'abonner aux erreurs
    this.playerWhistBidsFacade.error$
      .pipe(
        takeUntil(this.destroy$),
        tap(error => {
          this.error = error;
          if (error) {
            this.toastService.error(error);
          }
        })
      )
      .subscribe();

    // Charger les données pour la saison actuelle
    this.loadBidsBySeason(this.filterForm.get('season')?.value);

    // Écouter les changements de saison
    this.filterForm.get('season')?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        tap(season => this.loadBidsBySeason(season))
      )
      .subscribe();

    // Écouter les changements de joueur sélectionné
    this.filterForm.get('player')?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        tap(player => {
          this.selectedPlayerUuid = player;
          this.applyFilters();
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBidsBySeason(season: string): void {
    this.playerWhistBidsFacade.loadBidsBySeason(season);
  }

  applyFilters(): void {
    const searchTerm = this.filterForm.get('search')?.value?.toLowerCase() || '';

    if (!searchTerm) {
      this.filteredPlayerBids = [...this.playerBids];
    } else {
      this.filteredPlayerBids = this.playerBids.filter(playerBid => {
        const fullName = `${playerBid.playerFirstname} ${playerBid.playerLastName}`.toLowerCase();
        return fullName.includes(searchTerm);
      });
    }

    // Appliquer le tri
    this.sortData();

    // Recalculer la pagination
    this.totalPages = Math.ceil(this.filteredPlayerBids.length / this.pageSize);
    this.currentPage = 1;
    this.updatePaginatedPlayerBids();
  }

  // Méthode pour trier les données
  sortBy(column: string): void {
    if (this.sortColumn === column) {
      // Si on clique sur la même colonne, inverser l'ordre
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Sinon, trier par la nouvelle colonne en ordre ascendant
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortData();
    this.updatePaginatedPlayerBids();
  }

  // Méthode pour effectuer le tri
  sortData(): void {
    this.filteredPlayerBids.sort((a, b) => {
      let valueA: any;
      let valueB: any;

      if (this.sortColumn === 'playerName') {
        valueA = `${a.playerFirstname} ${a.playerLastName}`.toLowerCase();
        valueB = `${b.playerFirstname} ${b.playerLastName}`.toLowerCase();
      } else if (this.sortColumn === 'totalBids') {
        valueA = this.getTotalBids(a);
        valueB = this.getTotalBids(b);
      } else {
        return 0;
      }

      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  updatePaginatedPlayerBids(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.paginatedPlayerBids = this.filteredPlayerBids.slice(startIndex, startIndex + this.pageSize);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.updatePaginatedPlayerBids();
  }

  getPageNumbers(): number[] {
    const maxVisiblePages = 5;
    const pages: number[] = [];

    // Si le nombre total de pages est inférieur au max affichable
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Sinon, calculer quelles pages afficher
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let start = this.currentPage - halfVisible;
    let end = this.currentPage + halfVisible;

    // Ajuster les limites si on déborde
    if (start < 1) {
      end += (1 - start);
      start = 1;
    }

    if (end > this.totalPages) {
      start -= (end - this.totalPages);
      end = this.totalPages;
    }

    // S'assurer que start ne descend pas en dessous de 1
    start = Math.max(1, start);

    // Générer la liste des numéros de page
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  getBidDescription(bidType: WhistBid): string {
    return getBidDescription(bidType);
  }

  // Calcule le nombre total d'annonces pour un joueur
  getTotalBids(playerBids: PlayerWhistBids): number {
    return playerBids.bidDetails.reduce((total, bid) => {
      const points = WhistBidPoints[bid.bidType] * bid.count;
      return total + points;
    }, 0);
  }

  // Calcule le nombre d'annonces d'un type spécifique pour un joueur
  getBidTypeCount(playerBids: PlayerWhistBids, bidType: WhistBid, success?: boolean): number {
    // Si success n'est pas défini, on renvoie le total comme avant
    if (success === undefined) {
      const bidDetail = playerBids.bidDetails.find(detail => detail.bidType === bidType);
      return bidDetail ? bidDetail.count : 0;
    }

    // Sinon on filtre par success/failure
    const bidDetail = playerBids.bidDetails.find(detail =>
      detail.bidType === bidType && detail.success === success
    );
    return bidDetail ? bidDetail.count : 0;
  }

  exportToExcel(): void {
    this.playerWhistBidsFacade.exportSeasonBidsToExcel(this.currentSeason)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.toastService.error('Erreur lors de l\'exportation');
          return EMPTY;
        })
      )
      .subscribe();
  }

  openImportDialog(): void {
    this.showImportDialog = true;
  }

  closeImportDialog(): void {
    this.showImportDialog = false;
  }

  importData(file: File): void {
    const currentSeason = this.filterForm.get('season')?.value;

    if (!currentSeason) {
      this.toastService.error('Veuillez sélectionner une saison pour importer des données.');
      this.closeImportDialog();
      return;
    }

    this.playerWhistBidsFacade.importSeasonBidsFromExcel(currentSeason, file)
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          this.toastService.success('Importation réussie !');
          this.loadBidsBySeason(currentSeason);
        }),
        catchError(error => {
          this.toastService.error(
            `Erreur lors de l'importation : ${error.error?.message || 'Une erreur est survenue'}`
          );
          return EMPTY;
        }),
        finalize(() => this.closeImportDialog())
      )
      .subscribe();
  }

  protected readonly WhistBidPoints = WhistBidPoints;
}
