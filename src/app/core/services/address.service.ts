import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';
import { Address, Page } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private http = inject(HttpClient);
  
  private readonly API_URL = `${environment.apiUrl}/api/users`;
  
  getAllAddresses(
    page = 0,
    size = 10,
    sortBy = 'zipCode',
    direction = 'asc',
    search = ''
  ): Observable<ApiResponse<Page<Address>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('direction', direction);
      
    if (search) {
      params = params.set('search', search);
    }
      
    return this.http.get<ApiResponse<Page<Address>>>(
      `${environment.apiUrl}/api/addresses`, 
      { params }
    );
  }
  
  getAddresses(
    userId: number,
    page = 0,
    size = 10,
    sortBy = 'zipCode',
    direction = 'asc',
    search = ''
  ): Observable<ApiResponse<Page<Address>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('direction', direction);
      
    if (search) {
      params = params.set('search', search);
    }
      
    return this.http.get<ApiResponse<Page<Address>>>(
      `${this.API_URL}/${userId}/addresses`, 
      { params }
    );
  }
  
  getAddressById(
    userId: number, 
    addressId: number
  ): Observable<ApiResponse<Address>> {
    return this.http.get<ApiResponse<Address>>(
      `${this.API_URL}/${userId}/addresses/${addressId}`
    );
  }
  
  createAddress(
    userId: number, 
    address: Address
  ): Observable<ApiResponse<Address>> {
    return this.http.post<ApiResponse<Address>>(
      `${this.API_URL}/${userId}/addresses`, 
      address
    );
  }
  
  updateAddress(
    userId: number, 
    addressId: number, 
    address: Address
  ): Observable<ApiResponse<Address>> {
    return this.http.put<ApiResponse<Address>>(
      `${this.API_URL}/${userId}/addresses/${addressId}`, 
      address
    );
  }
  
  deleteAddress(
    userId: number, 
    addressId: number
  ): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      `${this.API_URL}/${userId}/addresses/${addressId}`
    );
  }
} 