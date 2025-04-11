import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from "@ngx-translate/core";

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
}
