import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-rules',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.css']
})
export class RulesComponent {
  constructor(private toastService: ToastService) {
  }

  // Cette méthode pourrait être utilisée pour signaler des problèmes avec le règlement
  reportIssue(): void {
    this.toastService.info('Merci pour votre signalement. Un administrateur examinera votre demande.');
  }
}
