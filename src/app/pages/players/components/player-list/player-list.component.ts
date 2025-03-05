import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Player } from '../../../../models/player.interface';
import { PlayerCardComponent } from '../player-card/player-card.component';

@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [CommonModule, PlayerCardComponent, FormsModule],
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.css']
})
export class PlayerListComponent implements OnInit {
  @Input() players: Player[] | null = [];
  @Output() selectPlayer = new EventEmitter<Player>();
  @Output() deletePlayer = new EventEmitter<string>();

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  pageSizeOptions = [5, 10, 25, 50];

  // Pour l'utiliser dans le template
  Math = Math;

  // Recherche
  searchText = '';

  // Données filtrées et paginées
  filteredPlayers: Player[] = [];
  displayedPlayers: Player[] = [];

  ngOnInit(): void {
    this.applyFiltersAndPagination();
  }

  ngOnChanges(): void {
    this.applyFiltersAndPagination();
  }

  applyFiltersAndPagination(): void {
    if (!this.players) {
      this.filteredPlayers = [];
      this.displayedPlayers = [];
      return;
    }

    // Filtrage
    this.filteredPlayers = this.searchText
      ? this.players.filter(player =>
        this.playerMatchesSearch(player, this.searchText.toLowerCase()))
      : [...this.players];

    // Pagination
    this.updateDisplayedPlayers();
  }

  private playerMatchesSearch(player: Player, search: string): boolean {
    // Vérifier la nullité des propriétés
    const firstName = player.firstName?.toLowerCase() || '';
    const lastName = player.lastName?.toLowerCase() || '';
    const email = player.email?.toLowerCase() || '';

    return firstName.includes(search) ||
      lastName.includes(search) ||
      email.includes(search);
  }

  updateDisplayedPlayers(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.displayedPlayers = this.filteredPlayers.slice(
      startIndex,
      startIndex + this.itemsPerPage
    );

    // Ajustement si la page actuelle est vide
    if (this.displayedPlayers.length === 0 && this.currentPage > 1) {
      this.currentPage = 1;
      this.updateDisplayedPlayers();
    }
  }

  onSearch(): void {
    this.currentPage = 1; // Revenir à la première page lors d'une recherche
    this.applyFiltersAndPagination();
  }

  changePageSize(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.itemsPerPage = parseInt(select.value, 10);
    this.currentPage = 1;
    this.applyFiltersAndPagination();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.applyFiltersAndPagination();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updateDisplayedPlayers();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedPlayers();
    }
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredPlayers.length / this.itemsPerPage));
  }

  get visiblePages(): number[] {
    const totalPages = this.totalPages;

    if (totalPages <= 5) {
      return Array.from({length: totalPages}, (_, i) => i + 1);
    }

    if (this.currentPage <= 3) {
      return [1, 2, 3, 4, 5].filter(page => page <= totalPages);
    }

    if (this.currentPage >= totalPages - 2) {
      return Array.from({length: 5}, (_, i) => totalPages - 4 + i).filter(page => page > 0);
    }

    return [this.currentPage - 1, this.currentPage, this.currentPage + 1];
  }
}
