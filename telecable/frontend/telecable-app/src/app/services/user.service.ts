import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

@Injectable({
providedIn:'root'
})

export class UserService{

api='http://localhost:3000/api/users'

constructor(private http:HttpClient){}

getUsers(){

return this.http.get(this.api)

}

crearUsuario(user:any){

return this.http.post(this.api,user)

}

actualizarDeuda(id:string,deuda:number){

return this.http.put(

`${this.api}/deuda/${id}`,

{deuda}

)

}

actualizarEstatus(id:string,estatus:string){

return this.http.put(

`${this.api}/estatus/${id}`,

{estatus}

)

}

}