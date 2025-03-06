import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({transform: 'translateY(-20px)', opacity: 0}),
        animate('300ms ease-out', style({transform: 'translateY(0)', opacity: 1}))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({transform: 'translateY(-20px)', opacity: 0}))
      ])
    ])
  ],
})
export class ToastComponent implements OnInit {
  @Input() visible = false;
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';
  @Input() message = '';
  @Input() duration = 5000;
  @Output() visibleChange = new EventEmitter<boolean>();

  private timeout: any;

  ngOnInit(): void {
    if (this.visible && this.duration > 0) {
      this.startTimeout();
    }
  }

  ngOnChanges(): void {
    if (this.visible && this.duration > 0) {
      this.clearTimeout();
      this.startTimeout();
    }
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.clearTimeout();
  }

  private startTimeout(): void {
    this.timeout = setTimeout(() => {
      this.close();
    }, this.duration);
  }

  private clearTimeout(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  ngOnDestroy(): void {
    this.clearTimeout();
  }
}
