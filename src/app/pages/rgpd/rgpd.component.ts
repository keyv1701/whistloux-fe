import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from "@ngx-translate/core";

@Component({
  selector: 'app-rgpd',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './rgpd.component.html',
  styleUrls: ['./rgpd.component.scss']
})
export class RgpdComponent {
  constructor() {
  }
}
