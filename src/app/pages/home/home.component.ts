import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from "@angular/common";
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from "@ngx-translate/core";
import { GalleryFacade } from "../gallery/facades/gallery.facade";
import { GalleryPhoto } from "../../models/gallery/gallery-photo.model";
import { Observable, Subscription, tap } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TranslatePipe, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  recentPhotos: GalleryPhoto[] = [];
  loading$: Observable<boolean>;
  currentSlide = 0;
  sliderPosition = 0;
  slidesToShow = 1; // Par défaut pour mobile
  private photosSubscription: Subscription | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor(
    private galleryFacade: GalleryFacade,
    private router: Router
  ) {
    this.loading$ = this.galleryFacade.loading$;
  }

  ngOnInit(): void {
    // Charger les photos récentes
    this.galleryFacade.loadPhotos();

    // S'abonner aux photos
    this.photosSubscription = this.galleryFacade.photos$.pipe(
      tap((photos: GalleryPhoto[]) => {
        // Limiter à 10 photos maximum
        this.recentPhotos = photos.slice(0, 10);
      })
    ).subscribe();

    // Détecter les changements de taille d'écran pour adapter le slider
    this.setupResizeObserver();
  }

  ngOnDestroy(): void {
    if (this.photosSubscription) {
      this.photosSubscription.unsubscribe();
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private setupResizeObserver(): void {
    // Déterminer le nombre de slides à afficher en fonction de la largeur
    this.updateSlidesToShow();

    // Observer les changements de taille d'écran
    this.resizeObserver = new ResizeObserver(() => {
      this.updateSlidesToShow();
      // Recalculer la position du slider si nécessaire
      if (this.currentSlide >= Math.ceil(this.recentPhotos.length / this.slidesToShow)) {
        this.goToSlide(0);
      } else {
        this.updateSliderPosition();
      }
    });

    this.resizeObserver.observe(document.body);
  }

  private updateSlidesToShow(): void {
    const width = window.innerWidth;
    if (width < 768) {
      this.slidesToShow = 1; // Mobile
    } else if (width < 1024) {
      this.slidesToShow = 2; // Tablette
    } else {
      this.slidesToShow = 3; // Desktop
    }
  }

  moveSlider(direction: number): void {
    const totalSlides = Math.ceil(this.recentPhotos.length / this.slidesToShow);
    this.currentSlide = (this.currentSlide + direction + totalSlides) % totalSlides;
    this.updateSliderPosition();
  }

  goToSlide(slideIndex: number): void {
    this.currentSlide = slideIndex;
    this.updateSliderPosition();
  }

  private updateSliderPosition(): void {
    // Calculer la position du slider en pourcentage
    this.sliderPosition = -100 * this.currentSlide;
  }

  getDots(): number[] {
    const totalSlides = Math.ceil(this.recentPhotos.length / this.slidesToShow);
    return Array(totalSlides).fill(0);
  }

  navigateToGallery(): void {
    this.router.navigate(['/gallery']);
  }
}
