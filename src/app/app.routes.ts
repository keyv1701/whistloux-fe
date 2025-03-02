import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PlayerComponent } from './pages/players/components/player.component';
import { TournamentComponent } from "./pages/tournaments/components/tournament.component";

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'players', component: PlayerComponent },
  { path: 'tournaments', component: TournamentComponent },
  { path: '**', redirectTo: 'home' } // Redirection pour les routes inconnues
];
