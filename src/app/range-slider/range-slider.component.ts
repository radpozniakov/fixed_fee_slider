import {
  Component,
  OnInit,
  Input,
  OnChanges,
  ViewChildren,
  QueryList,
  ElementRef,
  AfterViewInit
} from "@angular/core";

@Component({
  selector: "app-range-slider",
  templateUrl: "./range-slider.component.html",
  styleUrls: ["./range-slider.component.scss"]
})
export class RangeSliderComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() data: any;
  @ViewChildren("progressLine") progressLine: QueryList<ElementRef>;
  draggable = true;
  inBounds = true;
  edge = {
    top: true,
    bottom: true,
    left: true,
    right: true
  };
  _data = [];
  _progressLine = [];
  useHandle = false;
  lockAxis = "y";
  pos: any;
  left: any;
  position;
  movingOffset = { x: 0, y: 0 };
  endOffset = { x: 0, y: 0 };
  handlerWidth = 12;
  totalWidth: number;
  totalSum: number;
  realWidth: number;
  itemsData = [];
  constructor() {}

  ngOnInit(): void {
    if (this.data.length !== 0) {
      this.data.forEach(element => {
        this.totalWidth = element.width;
        this.totalSum = element.total;
        this._progressLine = element.coutry;
        this._data = element.coutry.slice(0, -1);
      });
    }
    this.calculateItemData(this._progressLine, this.totalSum);
    this.calcRealWidth(this._progressLine, this.totalWidth);
  }
  onStart(event) {
    //console.log("started output:", event);
  }

  onStop(event) {
    //console.log("stopped output:", event);
  }

  onMoving(event, index) {
    //this.calcPers(index, event.x);
     this.itemsData = this.calculateItemsNumbersFromPerc(this.calcPers(index,event.x),this.totalSum);
  }

  checkEdge(event) {
    // this.edge = event;
    //console.log('edge:', event);
  }

  onMoveEnd(event) {
    this.endOffset.x = event.x;
    this.endOffset.y = event.y;
  }

  calculateItemsNumbersFromPerc(array, total){
    return array.map((item, index) => {
      return {
        title: this.itemsData[index].title,
        ByPersentage: item,
        ByNumber: item * total / 100
      }
    })
  }
  comunismCalculaction(index, value) {
    let arrforReturn;

    // Все равномерно добавляем
    if (value < 0) {
      let homMuchAfterMe = this.itemsData.length - index - 1;
      let Positivedifference = value / homMuchAfterMe;
      arrforReturn = this.itemsData.map((item, indexMap) => {
        if (indexMap < index) {
          return item.ByPersentage;
        } else if (indexMap === index) {
          let trasformToPlus = value;
          trasformToPlus = -trasformToPlus;
          return item.ByPersentage - trasformToPlus;
        } else {
          return item.ByPersentage + Positivedifference;
        }
      });
    } else if (value === 0) {
      arrforReturn = this.itemsData.map(item => item.ByPersentage);
    }
    return arrforReturn;
  }
  calcPers(index, x) {
    let startPos = this.progressItemStartPosition(index);
    let endPos = x;
    let widthElement = endPos - startPos;
    let newPercange = (widthElement / this.realWidth) * 100;
    return this.comunismCalculaction(index,newPercange);
  }
  calcRealWidth(items, width) {
    if (items.length > 0 && items.length !== 1) {
      this.realWidth = width - (items.length - 1) * this.handlerWidth;
    } else {
      this.realWidth = width;
    }
  }

  calculateItemData(data, totalNumber) {
    data.map(item => {
      this.itemsData.push({
        ByPersentage: (item.value / totalNumber) * 100,
        ByNumber: item.value,
        title: item.title
      });
    });
  }

  progressItemWidth(index) {
    return (this.itemsData[index].ByPersentage * this.realWidth) / 100;
  }
  progressItemStartPosition(index) {
    if (index === 0) return 0;
    let sum = 0;
    let i = 0;
    while (i < index) {
      sum = sum + this.progressItemWidth(i) + this.handlerWidth;
      i++;
    }
    return sum;
  }

  getStyle(index) {
    return {
      left: this.progressItemStartPosition(index) + "px",
      width: this.progressItemWidth(index) + "px"
    };
  }
  getPositionHandler(index) {
    let sumPos = 0;
    let i = 0;
    while (i < index + 1) {
      sumPos =
        sumPos +
        (this.realWidth * this.itemsData[i].ByPersentage) / 100 +
        this.handlerWidth;
      i++;
    }
    return sumPos - this.handlerWidth;
  }
  stylePositionHandler(index) {
    return {
      left: this.getPositionHandler(index) + "px"
    };
  }
  getTotalWidthSlider() {
    return {
      width: this.totalWidth + "px"
    };
  }
  getRefEl(indexEl, item) {
    if (indexEl === indexEl) {
      return item;
    }
  }
}
