import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ExcelParentComponent } from './components/excel-parent/excel-parent.component';
import { PageActionComponent } from './components/page-action/page-action.component';
import { CellPropsActionComponent } from './components/cell-props-action/cell-props-action.component';
import { FormulaActionComponent } from './components/formula-action/formula-action.component';
import { GridComponent } from './components/grid/grid.component';
import { SheetsComponent } from './components/sheets/sheets.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    AppComponent,
    ExcelParentComponent,
    PageActionComponent,
    CellPropsActionComponent,
    FormulaActionComponent,
    GridComponent,
    SheetsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatIconModule,
    BrowserAnimationsModule,
    CommonModule,
    MatTooltipModule,
    MatButtonModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
