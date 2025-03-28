import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WhistBid, WhistBidPoints } from "../../../../models/bids/whist-bid.enum";

@Component({
  selector: 'app-player-whist-form',
  templateUrl: './player-whist-form.component.html',
  styleUrls: ['./player-whist-form.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class PlayerWhistFormComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  @Output() formChange = new EventEmitter<FormArray>();

  whistBidTypes: WhistBid[] = Object.values(WhistBid);

  constructor(private fb: FormBuilder) {
  }

  ngOnInit(): void {
  }

  get bidDetailsArray(): FormArray {
    return this.parentForm.get('bidDetails') as FormArray;
  }

  createBidDetailGroup(): FormGroup {
    return this.fb.group({
      bidType: [null, Validators.required],
      count: [1, [Validators.required, Validators.min(1)]],
      success: [false]
    });
  }

  addBidDetail(): void {
    this.bidDetailsArray.push(this.createBidDetailGroup());
    this.formChange.emit(this.bidDetailsArray);
  }

  removeBidDetail(index: number): void {
    this.bidDetailsArray.removeAt(index);
    this.formChange.emit(this.bidDetailsArray);
  }

  getBidPoints(bidType: string | WhistBid): number {
    // Si bidType est une chaîne, on s'assure de la convertir en WhistBid
    const bid = typeof bidType === 'string' ? bidType as WhistBid : bidType;
    return WhistBidPoints[bid];
  }
}
