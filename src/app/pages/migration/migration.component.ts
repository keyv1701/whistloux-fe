import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-migration',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './migration.component.html',
  styleUrls: ['./migration.component.css']
})
export class MigrationComponent {
  currentYear = new Date().getFullYear();
}
