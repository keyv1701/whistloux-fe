import { Component } from '@angular/core';
import { CommonModule } from "@angular/common";
import { TranslatePipe } from "@ngx-translate/core";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  showPopup = true;

  closePopup() {
    this.showPopup = false;
  }

}
