import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.css']
})
export class ConfirmationComponent implements OnInit {
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() confirmButtonText: string = '';
  @Input() cancelButtonText: string = '';
  @Input() confirmButtonColor: 'primary' | 'danger' | 'warning' | 'success' = 'danger';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  constructor(private translateService: TranslateService) {
  }

  ngOnInit(): void {
    if (!this.title) {
      this.title = this.translateService.instant('confirmation.title');
    }
    if (!this.message) {
      this.message = this.translateService.instant('confirmation.message');
    }
    if (!this.confirmButtonText) {
      this.confirmButtonText = this.translateService.instant('confirmation.confirmButtonText');
    }
    if (!this.cancelButtonText) {
      this.cancelButtonText = this.translateService.instant('confirmation.cancelButtonText');
    }
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
