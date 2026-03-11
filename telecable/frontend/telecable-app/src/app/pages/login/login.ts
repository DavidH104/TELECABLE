import { Component,ChangeDetectorRef,AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../services/auth.service';

@Component({
selector:'app-login',
standalone:true,
imports:[FormsModule,CommonModule],
templateUrl:'./login.html',
styleUrl:'./login.css'
})

export class Login implements AfterViewInit{

usuario=""
password=""
contrato=""

constructor(
private auth:AuthService,
private router:Router,
private cd:ChangeDetectorRef
){}

/* LOGIN ADMIN */

loginAdmin(){

this.auth.loginAdmin({

usuario:this.usuario,
password:this.password

}).subscribe((res:any)=>{

this.router.navigate(['/admin'])

})

}

/* LOGIN USUARIO */

loginUsuario(){

this.auth.loginUsuario({

contrato:this.contrato

}).subscribe((res:any)=>{

this.router.navigate(['/usuario'])

})

}

ngAfterViewInit(){

this.cd.detectChanges()

}

}