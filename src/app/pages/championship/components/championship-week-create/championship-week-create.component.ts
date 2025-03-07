// src/app/pages/championship/components/championship-week-create/championship-week-create.component.ts
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChampionshipWeek } from '../../../../models/championship/championship-week.model';

@Component({
  selector: 'app-championship-week-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './championship-week-create.component.html',
  styleUrls: ['./championship-week-create.component.css']
})
export class ChampionshipWeekCreateComponent {
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<ChampionshipWeek>();

  weekForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.weekForm = this.fb.group({
      date: ['', Validators.required],
      season: [new Date().getFullYear().toString(), Validators.required],
      description: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.weekForm.valid) {
      const newWeek: ChampionshipWeek = {
        ...this.weekForm.value,
      };
      this.saved.emit(newWeek);
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
