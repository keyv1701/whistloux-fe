import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from "@ngx-translate/core";

@Component({
  selector: 'app-import-modal',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './import-modal.component.html',
  styleUrls: ['./import-modal.component.css']
})
export class ImportModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() title = 'Importation de fichier';
  @Input() acceptTypes = '.xls,.xlsx,.csv';
  @Input() description = 'Sélectionnez un fichier XLS, XLSX ou CSV contenant les données à importer.';

  @Output() closeModal = new EventEmitter<void>();
  @Output() fileSelected = new EventEmitter<File>();
  @Output() importConfirmed = new EventEmitter<File>();

  @ViewChild('fileInput') fileInput!: ElementRef;

  selectedFile: File | null = null;

  constructor() {
  }

  ngOnInit(): void {
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
    }
  }

  onClose(): void {
    this.resetForm();
    this.closeModal.emit();
  }

  onImport(): void {
    if (this.selectedFile) {
      this.importConfirmed.emit(this.selectedFile);
    }
  }

  resetForm(): void {
    this.selectedFile = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
}
