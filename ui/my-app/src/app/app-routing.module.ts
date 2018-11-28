import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsersComponent } from './users/users.component'
import { ProjDescComponent } from './proj-desc/proj-desc.component'



const routes: Routes = [
  {
    path:'',
    component: UsersComponent
  },
  {
    path:'proj_desc',
    component: ProjDescComponent
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
