// src/app/shared/components/header/header.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthFacade } from "../../security/auth/facades/auth.facade";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  constructor(public authFacade: AuthFacade) {
  }

  logout(): void {
    this.authFacade.logout().subscribe();
  }
}
