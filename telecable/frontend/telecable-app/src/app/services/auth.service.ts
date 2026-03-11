import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
providedIn:'root'
})

export class AuthService{

api="http://localhost:3000/api/auth"

constructor(private http:HttpClient){}

/* LOGIN ADMIN */

loginAdmin(data:any){

return this.http.post(this.api+"/admin",data)

}

/* LOGIN USUARIO */

loginUsuario(data:any){

return this.http.post(this.api+"/usuario",data)

}

}