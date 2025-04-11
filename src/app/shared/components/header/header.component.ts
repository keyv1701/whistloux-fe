import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthFacade } from "../../security/auth/facades/auth.facade";
import { TranslatePipe, TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  showMobileMenu = false;
  currentLang: string;
  showLanguageMenu = false;

  constructor(
    public authFacade: AuthFacade,
    private translateService: TranslateService
  ) {
    this.currentLang = this.translateService.currentLang || 'fr';
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu() {
    this.showMobileMenu = false;
  }

  changeLang(lang: string): void {
    this.translateService.use(lang);
    this.currentLang = lang;
    this.showLanguageMenu = false;
  }

  toggleLanguageMenu(): void {
    this.showLanguageMenu = !this.showLanguageMenu;
  }

  get availableLanguages(): { code: string, displayCode: string }[] {
    return [
      {code: 'fr', displayCode: 'FR'},
      {code: 'nl', displayCode: 'NL'}
    ];
  }

  get currentLanguage(): { code: string, displayCode: string } {
    return this.availableLanguages.find(lang => lang.code === this.currentLang) || this.availableLanguages[0];
  }

  logout(): void {
    this.authFacade.logout().subscribe();
  }
}
