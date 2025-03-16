import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EMPTY, Subject } from 'rxjs';
import { catchError, finalize, takeUntil, tap } from 'rxjs/operators';
import { PlayerWhistBidsFacade } from '../../facades/player-whist-bids.facade';
import { PlayerWhistBids } from '../../../../models/bids/player-whist-bids.model';
import { WhistBid, WhistBidPoints } from "../../../../models/bids/whist-bid.enum";
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
    ImportModalComponent,
    FormsModule
  ]
})
export class PlayerWhistBidsListPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  playerBids: PlayerWhistBids[] = [];
  filteredPlayerBids: PlayerWhistBids[] = [];
  paginatedPlayerBids: PlayerWhistBids[] = [];

  currentPage = 1;
  itemsPerPage = 10;
  pageSizeOptions = [5, 10, 20, 50];
  totalPages = 1;
  visiblePages: number[] = [];
  Math = Math; // Pour utiliser Math dans le template

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

    this.calculateTotalPages();
    this.updatePaginatedPlayerBids();
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

    this.currentPage = 1;
    this.calculateTotalPages();
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

      switch (this.sortColumn) {
        case 'playerName':
          valueA = `${a.playerFirstname} ${a.playerLastName}`.toLowerCase();
          valueB = `${b.playerFirstname} ${b.playerLastName}`.toLowerCase();
          break;
        case 'totalBids':
          valueA = this.getTotalBids(a);
          valueB = this.getTotalBids(b);
          break;
        case 'bidCount':
          valueA = this.getTotalBidCount(a);
          valueB = this.getTotalBidCount(b);
          break;
        case 'successRate':
          valueA = this.getSuccessBidCount(a) / (this.getTotalBidCount(a) || 1);
          valueB = this.getSuccessBidCount(b) / (this.getTotalBidCount(b) || 1);
          break;
        case 'avgPoints':
          valueA = this.getTotalBids(a) / (this.getTotalBidCount(a) || 1);
          valueB = this.getTotalBids(b) / (this.getTotalBidCount(b) || 1);
          break;
        case 'pointsWon':
          valueA = this.getPointsWon(a);
          valueB = this.getPointsWon(b);
          break;
        case 'pointsLost':
          valueA = this.getPointsLost(a);
          valueB = this.getPointsLost(b);
          break;
        default:
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

  private updatePaginatedPlayerBids(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedPlayerBids = this.filteredPlayerBids.slice(startIndex, startIndex + this.itemsPerPage);
  }

  // Calcule le nombre total d'annonces pour un joueur
  getTotalBids(playerBids: PlayerWhistBids): number {
    return playerBids.bidDetails.reduce((total, bid) => {
      if (bid.success) {
        // Points positifs pour les annonces réussies
        return total + (WhistBidPoints[bid.bidType] * bid.count);
      } else {
        // Points négatifs pour les annonces échouées
        return total - (WhistBidPoints[bid.bidType] * bid.count);
      }
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

  // Calcule le nombre total d'annonces (succès + échecs) pour un joueur
  getTotalBidCount(playerBids: PlayerWhistBids): number {
    return playerBids.bidDetails.reduce((total, bid) => total + bid.count, 0);
  }

// Calcule le nombre d'annonces réussies pour un joueur
  getSuccessBidCount(playerBids: PlayerWhistBids): number {
    return playerBids.bidDetails.reduce((total, bid) => {
      if (bid.success) {
        return total + bid.count;
      }
      return total;
    }, 0);
  }

// Calcule le pourcentage de réussite pour un joueur
  getSuccessPercentage(playerBids: PlayerWhistBids): string {
    const totalBids = this.getTotalBidCount(playerBids);
    if (totalBids === 0) return '0%';

    const successBids = this.getSuccessBidCount(playerBids);
    const percentage = (successBids / totalBids) * 100;
    return `${percentage.toFixed(1)}%`;
  }

// Calcule la moyenne de points par annonce
  getPointsPerBid(playerBids: PlayerWhistBids): string {
    const totalBids = this.getTotalBidCount(playerBids);
    if (totalBids === 0) return '0';

    const totalPoints = this.getTotalBids(playerBids);
    const average = totalPoints / totalBids;
    return average.toFixed(1);
  }

// Calcule les points gagnés (annonces réussies)
  getPointsWon(playerBids: PlayerWhistBids): number {
    return playerBids.bidDetails.reduce((total, bid) => {
      if (bid.success) {
        return total + (WhistBidPoints[bid.bidType] * bid.count);
      }
      return total;
    }, 0);
  }

// Calcule les points perdus (annonces échouées)
  getPointsLost(playerBids: PlayerWhistBids): number {
    return playerBids.bidDetails.reduce((total, bid) => {
      if (!bid.success) {
        return total + (WhistBidPoints[bid.bidType] * bid.count);
      }
      return total;
    }, 0);
  }


// Ajouter ces méthodes à la classe
  private calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredPlayerBids.length / this.itemsPerPage);
    this.updateVisiblePages();
  }

  private updateVisiblePages(): void {
    this.visiblePages = [];
    const startPage = Math.max(this.currentPage - 1, 1);
    const endPage = Math.min(startPage + 2, this.totalPages);

    for (let i = startPage; i <= endPage; i++) {
      this.visiblePages.push(i);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedPlayerBids();
      this.updateVisiblePages();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedPlayerBids();
      this.updateVisiblePages();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedPlayerBids();
      this.updateVisiblePages();
    }
  }

  changePageSize(event: any): void {
    this.itemsPerPage = parseInt(event.target.value, 10);
    this.currentPage = 1; // Retour à la première page
    this.calculateTotalPages();
    this.updatePaginatedPlayerBids();
  }


  protected readonly WhistBidPoints = WhistBidPoints;
}
