import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './components/app/app.component';
import { RouterModule, RouterOutlet, Routes } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RespondentsComponent } from './components/respondents/respondents.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatOptionModule } from '@angular/material/core';
import { AddRespondentsComponent } from './components/add-respondents/add-respondents.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { ClipboardModule } from '@angular/cdk/clipboard';


export const routes: Routes = [
    {path: 'login', component: LoginComponent},
    {path: 'respondents', component: RespondentsComponent},
    {path: '', component: RespondentsComponent},
];

@NgModule({
  imports: [
    BrowserModule,
    RouterOutlet,
    RouterModule.forRoot(routes),
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatTableModule,
    MatPaginatorModule,
    MatOptionModule,
    MatDialogModule,
    HttpClientModule,
    ClipboardModule
  ],
  declarations: [
    AppComponent, 
    LoginComponent, 
    DashboardComponent,
    RespondentsComponent, 
    AddRespondentsComponent
    ],
  bootstrap: [AppComponent],
  providers: [
    provideAnimationsAsync(),
    {provide: 'dialog', useClass: MatDialog},
  ],
})
export class AppModule {}
