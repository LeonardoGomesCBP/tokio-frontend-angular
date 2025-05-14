import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';
import { Page, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  
  private readonly API_URL = `${environment.apiUrl}/api/users`;
  
  getUsers(
    page = 0, 
    size = 10, 
    sortBy = 'name', 
    direction = 'asc',
    search = ''
  ): Observable<ApiResponse<Page<User>>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('direction', direction);
      
    if (search) {
      params = params.set('search', search);
    }
      
    return this.http.get<ApiResponse<Page<User>>>(this.API_URL, { params });
  }
  
  getUserById(id: number): Observable<ApiResponse<User>> {
    return this.http.get<ApiResponse<User>>(`${this.API_URL}/${id}`);
  }
  
  createUser(user: User): Observable<ApiResponse<User>> {
    return this.http.post<ApiResponse<User>>(this.API_URL, user);
  }
  
  updateUser(id: number, user: User): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.API_URL}/${id}`, user);
  }
  
  updatePassword(id: number, password: string): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(
      `${this.API_URL}/${id}/password`, 
      { password }
    );
  }
  
  deleteUser(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.API_URL}/${id}`);
  }
} 