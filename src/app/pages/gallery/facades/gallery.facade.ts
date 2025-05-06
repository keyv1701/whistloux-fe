// src/app/core/facades/gallery/gallery.facade.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, of, tap } from 'rxjs';
import { GalleryApiService } from "../services/gallery.service";
import { GalleryPhoto } from "../../../models/gallery/gallery-photo.model";

@Injectable({
  providedIn: 'root'
})
export class GalleryFacade {
  private photosSubject = new BehaviorSubject<GalleryPhoto[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);

  // Exposer des observables publics
  photos$ = this.photosSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  constructor(private galleryApiService: GalleryApiService) {
  }

  loadPhotos(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.galleryApiService.getPhotos().pipe(
      tap(photos => {
        this.photosSubject.next(photos);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.errorSubject.next('Erreur lors du chargement des photos');
        this.loadingSubject.next(false);
        return of([]);
      })
    ).subscribe();
  }

  getPhotoUrl(photo: GalleryPhoto): string {
    return photo.url || `assets/${photo.name}`;
  }

  getPhotoNames(): string[] {
    return this.photosSubject.value.map(photo => photo.name);
  }
}
