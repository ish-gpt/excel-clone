import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GridStyleHelperService {
  activeCell: any = {};
  currentCell: any = {};
  previousCell:any = null;
  sheetDb: any = [];
  sheetDataSubject = new Subject();
  addEffect = new Subject();
  populateFormula = new Subject();
  requestCellValue = new Subject();
  showFormulaValueOnSelectedCell = new Subject();
  traceCellToBlue = new Subject();
  traceCellToGrey = new Subject();
  pasteCellData = new Subject();
  operandStack:any = [];
  operatorStack: any = [];
  private requestCellData: any;
  copyRange: any;

  constructor() { }

  set cellValue(val:any) {
    this.requestCellData = val;
  }

  setActiveCell(row:any,col:any) {
    this.activeCell.row = row;
    this.activeCell.col = col;
  }

  getActiveCell() {
    return this.activeCell ? this.activeCell : null;
  }

  setDefaultProperties(rowLength:any,colLength:any) {
    for (let i = 0; i < rowLength; i++) {
      let sheetRow = [];
      for (let j = 0; j < colLength; j++) {
        let cellProp = {
          bold: false,
          italic: false,
          underlined: false,
          fontfamily: 'monospace',
          fontsize: '14',
          fontcolor:"#000000",
          bgcolor: "#ecf0f1",
          textaling: 'left',
          cellExpression: null,
          dependentCells: new Set()
        }
        sheetRow.push(cellProp);
      }
      this.sheetDb.push(sheetRow);
    }
  }

  highlightSelectedProperties(row: any, col: any) {
    let cell = this.deCodeCellIndex(this.activeCell);
    this.sheetDataSubject.next(this.sheetDb[cell.row][cell.col]);
  }

  deCodeCellIndex(cell: any) {
    cell.col = cell.col.charCodeAt() - 65;
    cell.row -= 1;
    return cell;
  }

  decodeCellString(str: any) {
    let cell:any = {};
    cell.col = str[0];
    cell.row = Number(str[1]);
    return this.deCodeCellIndex(cell);
  }

  addEffectOnClick(sheetDb:any) {
    this.addEffect.next(sheetDb);
  }

  populateCellFormula() {
    this.populateFormula.next(this.sheetDb[this.activeCell.row][this.activeCell.col]);
  }

  async evaluateExpression() { //for now use only single digits in expression(Supports single digit only).
    let expression = this.sheetDb[this.activeCell.row][this.activeCell.col].cellExpression, ch: any, operand1: any, operand2: any, operator: any;
    let val = '';
    let cycleDetected;
    for (let i = 0; i < expression.length; i++) {
      ch = expression[i];
      if ((ch != ' ' || ch != '/t')) {
        if (this.isValidChar(ch)) {
          val += ch;
          ch = expression[++i];
          val += ch;
          ch = val;
        }
        switch (ch) {
          case '(':
            this.operatorStack.push(ch);
            break;
          case '+':
          case '-':
          case '*':
          case '/':
            while (this.operatorStack.length && this.priorityOfOperator(ch) <= this.priorityOfOperator(this.operatorStack[this.operatorStack.length - 1])) {
              operand2 = this.operandStack.pop();
              operand1 = this.operandStack.pop();
              operator = this.operatorStack.pop();
              let result = this.evaluate(operand1, operand2, operator);
              this.operandStack.push(result);
            }
            this.operatorStack.push(ch);
            break;
          case ')':
            while (this.operatorStack[this.operatorStack.length - 1] != '(') {
              operand2 = this.operandStack.pop();
              operand1 = this.operandStack.pop();
              operator = this.operatorStack.pop();
              let result = this.evaluate(operand1, operand2, operator);
              this.operandStack.push(result);
            }
            this.operatorStack.pop();
            break;
          default:
            if (this.isValidChar(ch)) {
              let visited = Array(100).fill(0).map(() => Array(26).fill(0));
              let dependentOnCell = this.decodeCellString(ch);  // dependentOnCell(C1) means active cell is dependent on C1 
              visited[dependentOnCell.row][dependentOnCell.col] = 1;
              if (this.checkIfCyclicRelationExist(visited, this.activeCell)) {
                let response = confirm("Cycle Detected. Do you want to TRACE it?");
                while (response) {

                  this.traceCellToBlue.next(dependentOnCell);
                  await this.delayPromise();

                  await this.traceCyclicPath(visited, this.activeCell);
                  
                  this.traceCellToGrey.next(dependentOnCell);
                  await this.delayPromise();

                  response = confirm("Do you again want to TRACE it?");
                  visited = Array(100).fill(0).map(() => Array(26).fill(0));
                  //also make this visited array back to normal.Could cause error while again iterating.
                }
                cycleDetected = true;
                break;
              }
              this.setDependsOnCell(this.decodeCellString(ch));
              ch = this.getValueOnThisCell(ch);
            }
            this.operandStack.push(Number(ch));
            break;
        }
      }
      val = '';
    }
    let finalEvaluatedValue = this.operandStack.pop();
    this.operandStack.splice(0, this.operandStack.length);
    this.operatorStack.splice(0, this.operatorStack.length);
    return cycleDetected ? cycleDetected :finalEvaluatedValue;
  }

  priorityOfOperator(ch: any): any {
    switch (ch) {
      case '+':
      case '-':
        return 0;
      case '/':
      case '*':
        return 1;
    }
  }

  delayPromise() {
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, 500);
    })
  }

  isValidChar(ch:any) {
    if (ch == '(' || ch == ')' || ch == '+' || ch == '-' || ch == '/' || ch == '*' || ch == '1' || ch == '2' || ch == '3' || ch == '4' || ch == '5' || ch == '6' || ch == '7' || ch == '8' || ch == '9' || ch == '0') {
      return false;
    }
    return true;
  }

  evaluate(operand1: any, operand2: any, operator: any):any {
    switch (operator) {
      case '*':
        return Number(operand1) * Number(operand2);
      case '+':
        return Number(operand1) + Number(operand2);
      case '-':
        return Number(operand1) - Number(operand2);
      case '/':
        return Number(operand1) / Number(operand2);
    }
  }

  getValueOnThisCell(cell:any) {
    let cellIndex = this.decodeCellString(cell)
    this.requestValueAtCell(cellIndex);
    return this.requestCellData;
  }

  requestValueAtCell(cell:any) {
    this.requestCellValue.next(cell);
  }

  setDependsOnCell(cell: any) {
    this.currentCell = Object.assign({}, this.activeCell);
    if (!this.alreadyPresent(this.currentCell,cell)) {
      this.sheetDb[cell.row][cell.col].dependentCells.add(this.currentCell);
    }
  }

  alreadyPresent(cell: any,previousCell:any): boolean {
    let bool = false;
    this.sheetDb[previousCell.row][previousCell.col].dependentCells.forEach((ele: any) => {
      if (JSON.stringify(ele) === JSON.stringify(cell)) {
        bool = true;
      }
    });
    return bool;
  }

  async updateRecursively(cell: any) {
    let mySet = this.sheetDb[cell.row][cell.col].dependentCells;
    if (this.sheetDb[cell.row][cell.col].dependentCells.size != 0) {
      for (const value of mySet) {
        this.activeCell.row = value.row;
        this.activeCell.col = value.col;
        let result = await this.evaluateExpression();
        let data = {
          res: result,
          cell: this.activeCell
        }
        this.showFormulaValueOnSelectedCell.next(data);
        this.updateRecursively(this.activeCell);
      }
    }
   
  }

  checkIfCyclicRelationExist(visited: any, activeCell: any): boolean {
    if (visited[activeCell.row][activeCell.col]) { 
      return true;
    }
    if (this.sheetDb[activeCell.row][activeCell.col].dependentCells.size > 0) {
      visited[activeCell.row][activeCell.col] = 1;
      let mySet = this.sheetDb[activeCell.row][activeCell.col].dependentCells;
      for (const value of mySet) {
        let res = this.checkIfCyclicRelationExist(visited, value);
        // if (!res) {
          visited[activeCell.row][activeCell.col] = 0;
        // }
        return res;
      }
      return false;
    }
    return false;
  }

  uncodeCell(cell: any) {
    let str = "";
    str += String.fromCharCode(65 + cell.col);
    str += cell.row + 1;
    return str;
  }

  async traceCyclicPath(visited:any, activeCell:any) {
    await this.traceCyclicRelation(visited, activeCell);
  }

  async traceCyclicRelation(visited: any, activeCell: any):Promise<any> {
    if (visited[activeCell.row][activeCell.col]) {
      return true;
    }
    if (this.sheetDb[activeCell.row][activeCell.col].dependentCells.size > 0) {
      visited[activeCell.row][activeCell.col] = 1;
      let mySet = this.sheetDb[activeCell.row][activeCell.col].dependentCells;

      this.traceCellToBlue.next(activeCell);
      await this.delayPromise();

      for (const value of mySet) {
        let res = await this.traceCyclicRelation(visited, value);
        if (!res) {
          visited[activeCell.row][activeCell.col] = 0;
        }
        this.traceCellToGrey.next(activeCell);
        await this.delayPromise();

        return Promise.resolve(res);
      }
      return false;
    }
    return false;
  }

  performPasting(range:any) {
    this.pasteCellData.next(range);
  }

  set RangeOfCopying(range: any) {
    this.copyRange = range;
  }

  get RangeOfCopying() {
    return this.copyRange;
  }

  getRange() {
    // this.
  }
}
