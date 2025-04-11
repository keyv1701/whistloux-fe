import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.component.html',
})
export class ContactComponent implements OnInit {
  mapUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2536.375562766422!2d4.53086!3d50.546215!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c22a5e439a4689%3A0x6c7f8c217214e52a!2sRue%20du%20Berceau%2018%2C%201495%20Villers-la-Ville!5e0!3m2!1sfr!2sbe!4v1656669666666!5m2!1sfr!2sbe'
    );
  }

  ngOnInit(): void {
  }
}
