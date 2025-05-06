import { Routes } from '@angular/router';
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
import {
  PlayerWhistBidsListPageComponent
} from "./pages/bids/pages/player-whist-bids-list-page/player-whist-bids-list-page.component";
import { RgpdComponent } from "./pages/rgpd/rgpd.component";
import { RulesComponent } from "./pages/rules/rules.component";
import { ChangePasswordComponent } from "./pages/change-password/pages/change-password.component";
import { HomeComponent } from "./pages/home/home.component";
import { GalleryComponent } from "./pages/gallery/pages/gallery.component";

export const routes: Routes = [
  // {path: '', redirectTo: 'migration', pathMatch: 'full'},
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  // {path: 'migration', component: MigrationComponent},
  {path: 'migration', redirectTo: 'home', pathMatch: 'full'},
  {path: 'login', component: LoginComponent},
  {path: 'players', component: PlayerPageComponent},
  {path: 'contact', component: ContactComponent},
  {path: 'about', component: AboutComponent},
  {path: 'rgpd', component: RgpdComponent},
  {path: 'rules', component: RulesComponent},
  {path: 'gallery', component: GalleryComponent},
  {path: 'change-password', component: ChangePasswordComponent},
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
  {
    path: 'whist-bids', children: [
      {path: '', component: PlayerWhistBidsListPageComponent},
    ]
  },
  {path: '**', redirectTo: 'home'}
];
