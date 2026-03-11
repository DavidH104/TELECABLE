import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { UserService } from '../../services/user.service'

@Component({
selector:'app-admin-dashboard',
standalone:true,
imports:[CommonModule,FormsModule],
templateUrl:'./admin-dashboard.html'
})

export class AdminDashboard implements OnInit{

users:any[]=[]
filteredUsers:any[]=[]

searchText=''

activos=0
inactivos=0
suspendidos=0
cancelados=0

nuevo:any={
numero:'',
contrato:'',
nombre:'',
localidad:''
}

constructor(private userService:UserService){}

ngOnInit(){
this.cargarUsuarios()
}

cargarUsuarios(){

this.userService.getUsers().subscribe((data:any)=>{

this.users=data
this.filteredUsers=data

this.calcularEstatus()

})

}

calcularEstatus(){

this.activos=0
this.inactivos=0
this.suspendidos=0
this.cancelados=0

this.users.forEach(u=>{

if(u.estatus==="Activo") this.activos++
if(u.estatus==="Inactivo") this.inactivos++
if(u.estatus==="Suspendido") this.suspendidos++
if(u.estatus==="Cancelado") this.cancelados++

})

}

search(){

if(!this.searchText){
this.filteredUsers=this.users
return
}

let text=this.searchText.toLowerCase()

this.filteredUsers=this.users.filter(u=>

String(u.NUMERO).toLowerCase().includes(text) ||

String(u.N?.CONTRATOS).toLowerCase().includes(text) ||

String(u['NOMBRE DEL SUSCRIPTOR']).toLowerCase().includes(text) ||

String(u.LOCALIDAD).toLowerCase().includes(text)

)

}

actualizarDeuda(user:any){

let actual = user.deuda || 0
let mov = Number(user.movimiento || 0)

let nueva = actual + mov

this.userService
.actualizarDeuda(user._id,nueva)
.subscribe(()=>{

user.deuda=nueva
user.movimiento=''

})

}

cambiarEstatus(user:any){

this.userService
.actualizarEstatus(user._id,user.estatus)
.subscribe(()=>{

this.calcularEstatus()

})

}

agregarUsuario(){

let nuevoUsuario={

NUMERO:Number(this.nuevo.numero),

N:{
CONTRATOS:Number(this.nuevo.contrato)
},

"NOMBRE DEL SUSCRIPTOR":this.nuevo.nombre,

LOCALIDAD:this.nuevo.localidad,

estatus:"Activo",

deuda:0

}

this.userService.crearUsuario(nuevoUsuario)
.subscribe(()=>{

this.nuevo={
numero:'',
contrato:'',
nombre:'',
localidad:''
}

this.cargarUsuarios()

})

}

}