import { Component, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserService } from '../../services/user.service';

@Component({
selector: 'app-user-dashboard',
standalone: true,
imports: [CommonModule],
templateUrl: './user-dashboard.html',
styleUrl: './user-dashboard.css'
})

export class UserDashboard implements AfterViewInit{

user:any = {}

constructor(
private userService:UserService,
private cd:ChangeDetectorRef
){}

ngOnInit(){

this.userService.getUsers().subscribe((data:any)=>{

this.user = data[0]

/* FORZAR DETECCION DE CAMBIOS */

this.cd.detectChanges()

})

}

ngAfterViewInit(){

this.cd.detectChanges()

}

}