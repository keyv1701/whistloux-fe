import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthFacade } from "../../security/auth/facades/auth.facade";
import { TranslatePipe } from "@ngx-translate/core";

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();

  constructor(public authFacade: AuthFacade) {
  }
}
