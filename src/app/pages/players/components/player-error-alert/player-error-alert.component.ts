import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from "@ngx-translate/core";

@Component({
  selector: 'app-player-error-alert',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './player-error-alert.component.html',
  styleUrls: ['./player-error-alert.component.css']
})
export class PlayerErrorAlertComponent {
  @Input() error: string | null | undefined = null;
  @Output() dismiss = new EventEmitter<void>();
}
