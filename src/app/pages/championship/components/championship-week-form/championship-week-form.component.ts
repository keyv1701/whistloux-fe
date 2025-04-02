import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChampionshipWeek } from '../../../../models/championship/championship-week.model';
import { CommonModule } from "@angular/common";

@Component({
  selector: 'app-championship-week-form',
  standalone: true,
  templateUrl: './championship-week-form.component.html',
  imports: [
    ReactiveFormsModule, CommonModule
  ],
  styleUrls: ['./championship-week-form.component.css']
})
export class ChampionshipWeekFormComponent implements OnInit {
  @Input() week: ChampionshipWeek | null = null;
  @Input() championshipUuid!: string;
  @Input() formTitle: string = 'Semaine de championnat';
  @Input() submitButtonText: string = 'Enregistrer';

  @Output() formSubmit = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  weekForm!: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.weekForm = this.fb.group({
      date: [this.week?.date || '', Validators.required],
      description: [this.week?.description || ''],
      encodingComplete: [this.week?.encodingComplete || false],
    });
  }

  onSubmit(): void {
    if (this.weekForm.invalid) {
      return;
    }

    const formData = {
      ...this.weekForm.value,
      championshipId: this.championshipUuid,
      uuid: this.week?.uuid
    };

    this.loading = true;
    this.formSubmit.emit(formData);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
