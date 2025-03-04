import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PlayerComponent } from './pages/players/components/player.component';
import { TournamentViewComponent } from './pages/tournaments/pages/tournament-view/tournament-view.component';
import { TournamentAdminComponent } from './pages/tournaments/pages/tournament-admin/tournament-admin.component';
import { LoginComponent } from "./pages/login/components/login.component";

export const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {path: 'login', component: LoginComponent},
  {path: 'players', component: PlayerComponent},
  {
    path: 'tournaments', children: [
      {path: '', component: TournamentViewComponent},
      {path: 'admin', component: TournamentAdminComponent}
    ]
  },
  {path: '**', redirectTo: 'home'}
];
