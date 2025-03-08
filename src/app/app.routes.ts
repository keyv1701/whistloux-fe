import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PlayerPageComponent } from './pages/players/pages/player-page.component';
import { TournamentPageComponent } from './pages/tournaments/pages/tournament-page/tournament-page.component';
import { LoginComponent } from "./pages/login/components/login.component";
import {
  TournamentDetailPageComponent
} from "./pages/tournaments/pages/tournament-detail-page/tournament-detail-page.component";
import { ContactComponent } from "./pages/contact/contact.component";
import { AboutComponent } from "./pages/about/about.component";
import {
  ChampionshipWeekListPageComponent
} from "./pages/championship/pages/championship-week-list/championship-week-list-page.component";
import {
  ChampionshipWeekDetailPageComponent
} from "./pages/championship/pages/championship-week-detail/championship-week-detail-page.component";
import {
  ChampionshipResultPageComponent
} from "./pages/championship/pages/championship-result-page.component/championship-result-page.component";

export const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {path: 'login', component: LoginComponent},
  {path: 'players', component: PlayerPageComponent},
  {path: 'contact', component: ContactComponent},
  {path: 'about', component: AboutComponent},
  {
    path: 'tournaments', children: [
      {path: '', component: TournamentPageComponent},
      {path: ':uuid', component: TournamentDetailPageComponent}
    ]
  },
  {
    path: 'championship', children: [
      {path: '', component: ChampionshipWeekListPageComponent},
      {path: 'week/:uuid', component: ChampionshipWeekDetailPageComponent},
      {path: 'results/:season', component: ChampionshipResultPageComponent}
    ]
  },
  {path: '**', redirectTo: 'home'}
];
