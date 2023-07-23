import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CardsComponent } from './components/cards/cards.component';
import { EmployeeComponent } from './components/employee/employee.component';
import { ProductsComponent } from './components/products/products.component';
import { SalesComponent } from './components/sales/sales.component';
import { FutureComponent } from './components/future/future.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: "/employees",
    pathMatch: "full"
  },
  {
    path: 'users',
    component: CardsComponent
  },
  {
    path: 'employees',
    component: EmployeeComponent
  },
  {
    path: 'products',
    component: ProductsComponent
  },
  {
    path: 'sales',
    component: SalesComponent
  },
  {
    path: 'future',
    component: FutureComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
