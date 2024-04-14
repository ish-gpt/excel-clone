import { Component, ElementRef, OnInit, ViewChild, ViewChildren } from '@angular/core';
import { Subject } from 'rxjs';

import { GridStyleHelperService } from '../../providers/grid-style-helper.service';

@Component({
  selector: 'app-cell-props-action',
  templateUrl: './cell-props-action.component.html',
  styleUrls: ['./cell-props-action.component.css']
})
export class CellPropsActionComponent implements OnInit {
  isBoldEnabled: boolean = false;
  isItalicEnabled: boolean = false;
  isUnderlinedEnabled: boolean = false;
  isLeft: any = false;
  isRight: any = false;
  isCenter: any = false;
  range: any = null;
  @ViewChild('fontFamily') fontFamilySelector: ElementRef | any;
  @ViewChild('fontSize') fontSizeSelector: ElementRef | any;
  @ViewChild('textcolor') fontcolor: ElementRef | any;
  @ViewChild('bgcolor') bckgrndcolor: ElementRef | any;
  @ViewChildren('alignment') allAlignments: ElementRef | any;

  constructor(
    private gridStyleHelperService: GridStyleHelperService
  ) { }

  ngOnInit(): void {
    let cell = this.gridStyleHelperService.getActiveCell();
    if (Object.keys(cell).length) {
      cell = this.deCodeCellIndex(cell);
      this.isBoldEnabled = this.gridStyleHelperService.sheetDb[cell.row][cell.col].cellProp.bold;
    }
    this.gridStyleHelperService.sheetDataSubject.subscribe((data: any) => {
      this.isBoldEnabled = data.bold;
      this.isItalicEnabled = data.italic;
      this.isUnderlinedEnabled = data.underlined;
      this.fontFamilySelector.nativeElement.value = data.fontfamily;
      this.fontSizeSelector.nativeElement.value = data.fontsize.substring(0, 2);
      this.fontcolor.nativeElement.value = data.fontcolor;
      this.bckgrndcolor.nativeElement.value = data.bgcolor;
      this.isLeft = data.textaling === 'left' ? true : false;
      this.isRight = data.textaling === 'right' ? true : false;
      this.isCenter = data.textaling === 'center' ? true : false;
    })
  }

  onBoldClick() {
    let cell = this.gridStyleHelperService.getActiveCell();
    this.isBoldEnabled = !this.gridStyleHelperService.sheetDb[cell.row][cell.col].bold;
    this.gridStyleHelperService.sheetDb[cell.row][cell.col].bold = this.isBoldEnabled;
    this.gridStyleHelperService.addEffectOnClick(this.gridStyleHelperService.sheetDb[cell.row][cell.col]);
  }

  onUnderlineClick() {
    let cell = this.gridStyleHelperService.getActiveCell();
    this.isUnderlinedEnabled = !this.gridStyleHelperService.sheetDb[cell.row][cell.col].underlined;
    this.gridStyleHelperService.sheetDb[cell.row][cell.col].underlined = this.isUnderlinedEnabled;
    this.gridStyleHelperService.addEffectOnClick(this.gridStyleHelperService.sheetDb[cell.row][cell.col]);
  }

  onItalicClick() {
    let cell = this.gridStyleHelperService.getActiveCell();
    this.isItalicEnabled = !this.gridStyleHelperService.sheetDb[cell.row][cell.col].italic;
    this.gridStyleHelperService.sheetDb[cell.row][cell.col].italic = this.isItalicEnabled;
    this.gridStyleHelperService.addEffectOnClick(this.gridStyleHelperService.sheetDb[cell.row][cell.col]);
  }

  onFontFamilyChange(e: any) {
    let cell = this.gridStyleHelperService.getActiveCell();
    this.gridStyleHelperService.sheetDb[cell.row][cell.col].fontfamily = e.target.value;
    this.gridStyleHelperService.addEffectOnClick(this.gridStyleHelperService.sheetDb[cell.row][cell.col]);
  }

  onFontSizeChange(e: any) {
    let cell = this.gridStyleHelperService.getActiveCell();
    this.gridStyleHelperService.sheetDb[cell.row][cell.col].fontsize = e.target.value + 'px';
    this.gridStyleHelperService.addEffectOnClick(this.gridStyleHelperService.sheetDb[cell.row][cell.col]);
  }

  onFontColorChange(e: any) {
    let cell = this.gridStyleHelperService.getActiveCell();
    this.gridStyleHelperService.sheetDb[cell.row][cell.col].fontcolor = e.target.value;
    this.gridStyleHelperService.addEffectOnClick(this.gridStyleHelperService.sheetDb[cell.row][cell.col]);
  }

  onBackgroundColorChange(e: any) {
    let cell = this.gridStyleHelperService.getActiveCell();
    this.gridStyleHelperService.sheetDb[cell.row][cell.col].bgcolor = e.target.value;
    this.gridStyleHelperService.addEffectOnClick(this.gridStyleHelperService.sheetDb[cell.row][cell.col]);
  }

  onTextAlignmentClick(alignment: any) {
    this.setAlignment(alignment);
    let cell = this.gridStyleHelperService.getActiveCell();
    this.gridStyleHelperService.sheetDb[cell.row][cell.col].textaling = alignment;
    this.gridStyleHelperService.addEffectOnClick(this.gridStyleHelperService.sheetDb[cell.row][cell.col]);
  }

  deCodeCellIndex(cell: any) {
    cell.col = cell.col.charCodeAt() - 65;
    cell.row -= 1;
    return cell;
  }

  setAlignment(alignment: any) {
    switch (alignment) {
      case 'left':
        this.isLeft = true;
        this.isRight = false;
        this.isCenter = false;
        break;
      case 'right':
        this.isLeft = false;
        this.isRight = true;
        this.isCenter = false;
        break;
      case 'center':
        this.isLeft = false;
        this.isRight = false;
        this.isCenter = true;
        break;
    }
  }

  onContentCopy() {
    this.range = this.gridStyleHelperService.RangeOfCopying;
    if (!this.range || this.range.length<2) {
      alert('Select a Range to Copy');
      return;
    }
  }

  onContentPaste() {
    if (this.range) {
      this.gridStyleHelperService.performPasting(this.range);
    } else {
      alert('Nothing to paste');
      return;
    }
  }
}
