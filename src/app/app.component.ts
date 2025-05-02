import { Component, Inject, LOCALE_ID } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "./shared/components/header/header.component";
import { FooterComponent } from "./shared/components/footer/footer.component";
import { ToastComponent } from "./shared/components/toast/toast.component";
import { ToastService } from "./shared/services/toast.service";
import { AsyncPipe, CommonModule } from "@angular/common";
import { filter } from "rxjs/operators";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ToastComponent, AsyncPipe, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  toast$ = this.toastService.toast$;
  isMigrationPage = false;

  constructor(
    private toastService: ToastService,
    private router: Router,
    private translate: TranslateService,
    @Inject(LOCALE_ID) private localeId: string
  ) {
  }

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isMigrationPage = event.url === '/migration' || event.url === '/';
    });

    this.defineDefaultLanguage();
  }

  private defineDefaultLanguage() {
    // Langues supportées
    this.translate.addLangs(['fr', 'nl']);

    // Définir la langue par défaut
    this.translate.setDefaultLang('fr');

    // Essayer de détecter la langue du navigateur
    const browserLang = this.translate.getBrowserLang();

    // N'utiliser que fr ou nl, avec fr comme fallback
    const userLang = browserLang && ['fr', 'nl'].includes(browserLang) ? browserLang : 'fr';

    // Utiliser la langue
    this.translate.use(userLang);

    // Définir l'attribut lang sur l'élément HTML
    document.documentElement.lang = userLang;

    // S'abonner aux changements de langue
    this.translate.onLangChange.subscribe(event => {
      document.documentElement.lang = event.lang;
      // Ajouter cette ligne pour mettre à jour la meta balise aussi
      this.updateMetaLanguage(event.lang);
    });

    // Initialiser la meta balise
    this.updateMetaLanguage(userLang);
  }

  private updateMetaLanguage(lang: string) {
    // Mettre à jour les balises meta si elles existent
    const metaContentLanguage = document.querySelector('meta[http-equiv="Content-Language"]');
    const metaLanguage = document.querySelector('meta[name="language"]');

    if (metaContentLanguage) {
      metaContentLanguage.setAttribute('content', lang);
    }

    if (metaLanguage) {
      metaLanguage.setAttribute('content', lang);
    }
  }

  onToastVisibilityChange(visible: boolean): void {
    if (!visible) {
      this.toastService.clear();
    }
  }
}
