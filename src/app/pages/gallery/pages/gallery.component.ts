import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from "@ngx-translate/core";
import { Observable, Subscription, tap } from 'rxjs';
import { GalleryFacade } from "../facades/gallery.facade";
import { GalleryPhoto } from "../../../models/gallery/gallery-photo.model";

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit, OnDestroy {
  selectedPhoto: GalleryPhoto | null = null;
  selectedIndex: number = 0;
  showModal = false;
  photos: GalleryPhoto[] = [];
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  private photosSubscription: Subscription | null = null;

  constructor(private galleryFacade: GalleryFacade) {
    this.loading$ = this.galleryFacade.loading$;
    this.error$ = this.galleryFacade.error$;
  }

  ngOnInit(): void {
    // Charger les photos
    this.galleryFacade.loadPhotos();

    this.photosSubscription = this.galleryFacade.photos$.pipe(
      tap((photos: GalleryPhoto[]) => {
        this.photos = photos;
      })
    ).subscribe();

    // Ajouter le gestionnaire d'événements pour les touches
    document.addEventListener('keydown', this.handleKeyDown);
  }

  ngOnDestroy(): void {
    // Nettoyer les abonnements
    if (this.photosSubscription) {
      this.photosSubscription.unsubscribe();
    }

    // Supprimer le gestionnaire d'événements
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = (event: KeyboardEvent): void => {
    if (!this.showModal) return;

    switch (event.key) {
      case 'Escape':
        this.closeModal();
        break;
      case 'ArrowLeft':
        this.navigatePhotos(-1);
        break;
      case 'ArrowRight':
        this.navigatePhotos(1);
        break;
    }
  };

  getPhotos(): GalleryPhoto[] {
    return this.photos;
  }

  getPhotoUrl(photo: GalleryPhoto | string): string {
    if (typeof photo === 'string') {
      return `assets/${photo}`;
    }
    return this.galleryFacade.getPhotoUrl(photo);
  }

  openModal(photo: GalleryPhoto): void {
    this.selectedPhoto = photo;
    this.selectedIndex = this.photos.indexOf(photo);
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedPhoto = null;
  }

  downloadPhoto(): void {
    if (this.selectedPhoto) {
      // Crée un élément canvas pour manipuler l'image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.crossOrigin = 'anonymous'; // Important pour éviter les problèmes CORS
      img.onload = () => {
        // Définir les dimensions du canvas
        canvas.width = img.width;
        canvas.height = img.height;

        // Dessiner l'image sur le canvas
        ctx!.drawImage(img, 0, 0);

        // Convertir le canvas en URL de données
        try {
          const dataURL = canvas.toDataURL('image/png');

          // Créer un lien de téléchargement
          const link = document.createElement('a');
          link.href = dataURL;
          link.download = this.selectedPhoto!.name || 'photo.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (e) {
          console.error("Erreur lors du téléchargement de l'image:", e);
          // Méthode alternative pour les images externes
          this.downloadWithFetch();
        }
      };

      img.onerror = () => {
        console.error("Impossible de charger l'image pour le téléchargement");
        // Méthode alternative
        this.downloadWithFetch();
      };

      // Définir la source de l'image
      img.src = this.getPhotoUrl(this.selectedPhoto);
    }
  }

  private downloadWithFetch(): void {
    if (!this.selectedPhoto) return;

    const url = this.getPhotoUrl(this.selectedPhoto);
    const filename = this.selectedPhoto.name || 'photo.png';

    // Utiliser l'API fetch pour télécharger l'image
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl); // Libérer la mémoire
      })
      .catch(error => {
        console.error("Erreur lors du téléchargement avec fetch:", error);
      });
  }

  navigatePhotos(direction: number): void {
    if (this.photos.length <= 1) return;

    this.selectedIndex = (this.selectedIndex + direction + this.photos.length) % this.photos.length;
    this.selectedPhoto = this.photos[this.selectedIndex];
  }
}
