import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, map, catchError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ColorService {
  private cache: { [key: string]: string } = {};
  private colorMap: { [key: string]: string } = {
    '#000000': 'Black',
    '#ffffff': 'White',
    '#ff0000': 'Red',
    '#00ff00': 'Green',
    '#0000ff': 'Blue',
    '#ffff00': 'Yellow',
    '#ffa500': 'Orange',
    '#800080': 'Purple',
    '#ffc0cb': 'Pink',
    '#a52a2a': 'Brown',
    '#808080': 'Gray',
    '#00ffff': 'Cyan',
    '#ff00ff': 'Magenta',
    '#f5f5dc': 'Beige',
    '#ffd700': 'Gold',
    '#c0c0c0': 'Silver',
    '#4b0082': 'Indigo',
    '#ee82ee': 'Violet',
    '#008080': 'Teal',
    '#000080': 'Navy',
    '#15328a': 'Navy Blue',
    '#808000': 'Olive',
    '#fa8072': 'Salmon',
    '#ff7f50': 'Coral',
    '#40e0d0': 'Turquoise',
    '#e6e6fa': 'Lavender',
    '#a2a0a0': 'Silver Gray',
    '#333333': 'Charcoal',
    '#666666': 'Dim Gray',
    '#999999': 'Light Gray',
    '#f0f0f0': 'Off White'
  };

  constructor(private http: HttpClient) { }

  getColorName(hex: string): string {
    if (!hex) return '';
    const cleanHex = hex.startsWith('#') ? hex : '#' + hex;
    const key = cleanHex.toLowerCase();

    // Check local map first
    if (this.colorMap[key]) return this.colorMap[key];

    // Check runtime cache
    if (this.cache[key]) return this.cache[key];

    return cleanHex.toUpperCase();
  }

  fetchColorName(hex: string): Observable<string> {
    if (!hex) return of('');
    const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;
    const key = '#' + cleanHex.toLowerCase();

    // Check maps
    if (this.colorMap[key]) return of(this.colorMap[key]);
    if (this.cache[key]) return of(this.cache[key]);

    const url = `https://www.thecolorapi.com/id?hex=${cleanHex}`;
    return this.http.get<any>(url).pipe(
      map(res => res.name?.value || '#' + cleanHex.toUpperCase()),
      tap(name => this.cache[key] = name),
      catchError(() => of('#' + cleanHex.toUpperCase()))
    );
  }

  getMap() {
    return { ...this.colorMap };
  }
}
