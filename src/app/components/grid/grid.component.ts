import { Component, OnInit, AfterViewInit, ViewChildren, ElementRef } from '@angular/core';
import { GridStyleHelperService } from '../../providers/grid-style-helper.service';

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css']
})
export class GridComponent implements OnInit, AfterViewInit {
  cols: any = [];
  rows: any = [];
  isBoldEnabled: any;
  rowLength: number = 100;
  colLength: number = 26;
  activeRow: any; activeCol: any;
  @ViewChildren('gridCells') cells: ElementRef | any;
  isKEyCtrl: boolean = false;
  rangeStorage: any = [];
  copyData: any = [];
  copiedCellData: any;


  constructor(
    private gridStyleHelperService: GridStyleHelperService
  ) { }

  ngAfterViewInit(): void {
    this.gridStyleHelperService.setDefaultProperties(this.rowLength, this.colLength);
    this.gridStyleHelperService.addEffect.subscribe((data: any) => {
      this.isBoldEnabled = data.bold;
      this.cells._results[this.activeRow].nativeElement.childNodes[this.activeCol].style.fontWeight = data.bold ? "bold" : "normal";
      this.cells._results[this.activeRow].nativeElement.childNodes[this.activeCol].style.fontStyle = data.italic ? "italic" : "normal";
      this.cells._results[this.activeRow].nativeElement.childNodes[this.activeCol].style.textDecoration = data.underlined ? "underline" : "";
      this.cells._results[this.activeRow].nativeElement.childNodes[this.activeCol].style.fontFamily = data.fontfamily;
      this.cells._results[this.activeRow].nativeElement.childNodes[this.activeCol].style.fontSize = data.fontsize;
      this.cells._results[this.activeRow].nativeElement.childNodes[this.activeCol].style.color = data.fontcolor;
      this.cells._results[this.activeRow].nativeElement.childNodes[this.activeCol].style.backgroundColor = data.bgcolor;
      this.cells._results[this.activeRow].nativeElement.childNodes[this.activeCol].style.textAlign = data.textaling;
    });
    this.gridStyleHelperService.requestCellValue.subscribe((cellIndex: any) => {
      this.gridStyleHelperService.cellValue = (this.cells._results[cellIndex.row].nativeElement.childNodes[cellIndex.col].innerHTML)
    });
    this.gridStyleHelperService.showFormulaValueOnSelectedCell.subscribe((data: any) => {
      this.cells._results[data.cell.row].nativeElement.childNodes[data.cell.col].innerHTML = data.res;
    });
    this.gridStyleHelperService.traceCellToBlue.subscribe((data: any) => {
      this.cells._results[data.row].nativeElement.childNodes[data.col].style.backgroundColor = 'lightblue';
    });
    this.gridStyleHelperService.traceCellToGrey.subscribe((data: any) => {
      this.cells._results[data.row].nativeElement.childNodes[data.col].style.backgroundColor = '#ecf0f1';
    });
    this.gridStyleHelperService.pasteCellData.subscribe((data:any) => {
      let copiedRowLength = data[1].row - data[0].row + 1;
      let copiedColLength = data[1].col - data[0].col + 1;
      console.log(this.activeCol, this.activeRow);
      if ((this.activeCol + copiedColLength > 25) || (this.activeRow + copiedRowLength > 99)) {
        alert('Pasting not possible since copied range is bigger');
        return;
      } else {
        this.performPasting();
      }
    })
  }

  ngOnInit(): void {
    for (let i = 0; i < this.rowLength; i++){
      this.rows.push(i + 1);
    }
    for (let i = 0; i < this.colLength; i++) {
      this.cols.push(String.fromCharCode(65+i));
    }
  }

  async onCellClick(event: any, row: any, col: any) {
    let cell = this.gridStyleHelperService.deCodeCellIndex({ row: row, col: col });
    if (this.rangeStorage.length >= 2) {
      this.handleSelectionOnUI();
      this.rangeStorage = [];
      this.copiedCellData = this.copyData;
      this.copyData = [];
    };
    if (this.isKEyCtrl) {
      this.cells._results[cell.row].nativeElement.childNodes[cell.col].style.border = "1px solid #218c74";
      this.rangeStorage.push(cell);
      // console.log("--------------", this.rangeStorage);
      if (this.rangeStorage.length === 2) {
        this.setRange();
        this.copyDataOfCells();
      }
    }
    await this.updateDependentValuesRecursively(this.gridStyleHelperService.activeCell)
    this.gridStyleHelperService.setActiveCell(row, col);
    this.gridStyleHelperService.highlightSelectedProperties(row, col);
    this.gridStyleHelperService.populateCellFormula();

    //set active cell.
    this.activeCol = cell.col;
    this.activeRow = cell.row;
    
  }

  setRange() {
    this.gridStyleHelperService.RangeOfCopying = (this.rangeStorage);
  }

  async updateDependentValuesRecursively(cell: any) {
    if (Object.keys(cell).length != 0 && (this.gridStyleHelperService.sheetDb[cell.row][cell.col].dependentCells.size)) {
      await this.gridStyleHelperService.updateRecursively(cell);
    }
  }

  onKeyDown(event: any) {
    this.isKEyCtrl = event.ctrlKey;
  }

  onKeyUp(event: any) {
    if (!event.ctrlKey) {
      this.isKEyCtrl = event.ctrlKey;
    }
  }

  handleSelectionOnUI() {
    for (let i = 0; i < this.rangeStorage.length; i++){
      this.cells._results[this.rangeStorage[i].row].nativeElement.childNodes[this.rangeStorage[i].col].style.border = "1px solid lightgrey";
    }
  }

  copyDataOfCells() {
    for (let rowStart = this.rangeStorage[0].row; rowStart <= this.rangeStorage[1].row; rowStart++){
      let rowMap = new Map();
      for (let colStart = this.rangeStorage[0].col; colStart <= this.rangeStorage[1].col; colStart++){
        // console.log(this.cells._results[rowStart].nativeElement.childNodes[colStart].innerHTML);
        this.gridStyleHelperService.sheetDb[rowStart][colStart].cellValue = this.cells._results[rowStart].nativeElement.childNodes[colStart].innerHTML;
        rowMap.set({rowStart,colStart}, this.gridStyleHelperService.sheetDb[rowStart][colStart]);
      }
      this.copyData.push(rowMap);
    }
    // console.log(this.copyData);
  }

  performPasting() { // before doing this check if pasting is possible or not with row and col length.
    for (let row = this.activeRow, i = 0; row < (this.activeRow + this.copiedCellData.length); row++, i++){
      let col = 0;
      this.copiedCellData[i].forEach((value:any,key:any) => {
        this.cells._results[row].nativeElement.childNodes[this.activeCol + col].innerHTML = value.cellValue;
        this.cells._results[row].nativeElement.childNodes[this.activeCol + col].style.fontStyle = value.italic ? "italic" : "normal";
        this.cells._results[row].nativeElement.childNodes[this.activeCol + col].style.textDecoration = value.underlined ? "underline" : "";
        this.cells._results[row].nativeElement.childNodes[this.activeCol + col].style.fontWeight = value.bold ? "bold" : "normal";
        this.cells._results[row].nativeElement.childNodes[this.activeCol + col].style.fontFamily = value.fontfamily;
        this.cells._results[row].nativeElement.childNodes[this.activeCol + col].style.fontSize = value.fontsize;
        this.cells._results[row].nativeElement.childNodes[this.activeCol + col].style.color = value.fontcolor;
        this.cells._results[row].nativeElement.childNodes[this.activeCol + col].style.backgroundColor = value.bgcolor;
        this.cells._results[row].nativeElement.childNodes[this.activeCol + col].style.textAlign = value.textaling;
        this.updateSheetDb(row, value,col);
        col++;
      })
    }
  }

  updateSheetDb(row: any, value:any, col:any) {
    this.gridStyleHelperService.sheetDb[row][this.activeCol + col].bgcolor = value.bgcolor
    this.gridStyleHelperService.sheetDb[row][this.activeCol + col].bold = value.bold
    this.gridStyleHelperService.sheetDb[row][this.activeCol + col].cellExpression = value.cellExpression
    this.gridStyleHelperService.sheetDb[row][this.activeCol + col].dependentCells = value.dependentCells
    this.gridStyleHelperService.sheetDb[row][this.activeCol + col].fontcolor = value.fontcolor
    this.gridStyleHelperService.sheetDb[row][this.activeCol + col].fontfamily = value.fontfamily
    this.gridStyleHelperService.sheetDb[row][this.activeCol + col].fontsize = value.fontsize
    this.gridStyleHelperService.sheetDb[row][this.activeCol + col].italic = value.italic
    this.gridStyleHelperService.sheetDb[row][this.activeCol + col].textaling = value.textaling
    this.gridStyleHelperService.sheetDb[row][this.activeCol + col].underlined = value.underlined
  }

}
