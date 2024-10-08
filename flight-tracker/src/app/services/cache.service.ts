import { Injectable } from '@angular/core';


interface CacheItem<T> {
  data: T;
  expiration?: number;
}


@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache: {[key:string]:CacheItem<any>}={}

  constructor(){
    this.loadFromLocalStorage();
  }

  set<T>(key: string, data: T, expirationInMinutes?:number):void {
    const cacheItem:CacheItem<T>={data};
    if(expirationInMinutes){
      const expirationMs = expirationInMinutes*60*1000;
      cacheItem.expiration=Date.now() +expirationMs
    }
      
    this.cache[key]=cacheItem
    this.saveToLocalStorage();
  }

  get<T>(key:string):T | null {
    const cached = this.cache[key];
    if(!cached) return null;
    if(cached.expiration && Date.now() > cached.expiration){
      this.remove(key)
      // delete this.cache[key];
      return null
    }
    return cached.data
  }
  remove(key:string):void{
    delete this.cache[key];
    this.saveToLocalStorage();
  }

  clear(): void{
    this.cache = {}
    localStorage.removeItem('appCache')
  }

  private saveToLocalStorage():void{
    localStorage.setItem('appCache', JSON.stringify(this.cache))
  }

 private loadFromLocalStorage():void{
  const storedCache = localStorage.getItem('appCache')
  if(storedCache){
    this.cache = JSON.parse(storedCache)
  }
 }
}
