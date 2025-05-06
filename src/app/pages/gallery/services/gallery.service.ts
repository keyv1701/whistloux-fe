import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { GalleryPhoto } from "../../../models/gallery/gallery-photo.model";

@Injectable({
  providedIn: 'root'
})
export class GalleryApiService {
  private apiUrl = `${environment.apiBaseUrl}/gallery`;

  constructor(private http: HttpClient) {
  }

  getPhotos(): Observable<GalleryPhoto[]> {
    return this.http.get<GalleryPhoto[]>(`${this.apiUrl}/photos`);
  }

  getPhotoById(id: string): Observable<GalleryPhoto> {
    return this.http.get<GalleryPhoto>(`${this.apiUrl}/photos/${id}`);
  }
}
