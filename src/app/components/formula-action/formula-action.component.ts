import { Component, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { GridStyleHelperService } from 'src/app/providers/grid-style-helper.service';

@Component({
  selector: 'app-formula-action',
  templateUrl: './formula-action.component.html',
  styleUrls: ['./formula-action.component.css']
})
export class FormulaActionComponent implements OnInit, AfterViewInit {

  @ViewChild('formulaExpression') expression: ElementRef | any;

  constructor(
    private gridStyleHelperService: GridStyleHelperService
  ) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.gridStyleHelperService.populateFormula.subscribe((data: any) => {
      this.expression.nativeElement.value = data.cellExpression ? data.cellExpression : '';
    })
  }

  async onEnterEvent(event: any) {
    let expression = event.target.value;
    let activeCell = this.gridStyleHelperService.activeCell;
    this.gridStyleHelperService.sheetDb[activeCell.row][activeCell.col].cellExpression = expression;
    let result = await this.gridStyleHelperService.evaluateExpression();
    if (result === true || !result) { 
      this.expression.nativeElement.value = "";
      this.gridStyleHelperService.sheetDb[activeCell.row][activeCell.col].cellExpression = "";
    }
    else {
      let data = {
        res: result,
        cell: activeCell
      }
      // console.log(result, activeCell);
      this.gridStyleHelperService.showFormulaValueOnSelectedCell.next(data);
    }
  }

}
