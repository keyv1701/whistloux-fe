import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PlayerComponent } from './pages/players/components/player.component';
import { TournamentPageComponent } from './pages/tournaments/pages/tournament-page/tournament-page.component';
import { LoginComponent } from "./pages/login/components/login.component";
import {
  TournamentDetailPageComponent
} from "./pages/tournaments/pages/tournament-detail-page/tournament-detail-page.component";

export const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {path: 'login', component: LoginComponent},
  {path: 'players', component: PlayerComponent},
  {
    path: 'tournaments', children: [
      {path: '', component: TournamentPageComponent},
      {path: ':uuid', component: TournamentDetailPageComponent}
    ]
  },
  {path: '**', redirectTo: 'home'}
];
