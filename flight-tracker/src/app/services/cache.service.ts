import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface CacheItem<T> {
  data: T;
  expiration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache: {[key: string]: CacheItem<any>} = {};
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      this.loadFromLocalStorage();
    }
  }

  set<T>(key: string, data: T, expirationInMinutes?: number): void {
    const cacheItem: CacheItem<T> = { data };
    if (expirationInMinutes) {
      const expirationMs = expirationInMinutes * 60 * 1000;
      cacheItem.expiration = Date.now() + expirationMs;
    }
      
    this.cache[key] = cacheItem;
    if (this.isBrowser) {
      this.saveToLocalStorage();
    }
  }

  get<T>(key: string): T | null {
    const cached = this.cache[key];
    if (!cached) return null;
    if (cached.expiration && Date.now() > cached.expiration) {
      this.remove(key);
      return null;
    }
    return cached.data;
  }

  remove(key: string): void {
    delete this.cache[key];
    if (this.isBrowser) {
      this.saveToLocalStorage();
    }
  }

  clear(): void {
    this.cache = {};
    if (this.isBrowser) {
      localStorage.removeItem('appCache');
    }
  }

  private saveToLocalStorage(): void {
    if (this.isBrowser) {
      localStorage.setItem('appCache', JSON.stringify(this.cache));
    }
  }

  private loadFromLocalStorage(): void {
    if (this.isBrowser) {
      const storedCache = localStorage.getItem('appCache');
      if (storedCache) {
        this.cache = JSON.parse(storedCache);
      }
    }
  }
}
