import {
  Component,
  OnInit,
  Input,
  ViewChildren,
  QueryList,
  ElementRef,
} from "@angular/core";

@Component({
  selector: "app-range-slider",
  templateUrl: "./range-slider.component.html",
  styleUrls: ["./range-slider.component.scss"]
})

export class RangeSliderComponent implements OnInit {
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
  freaze = [];
  useHandle = false;
  lockAxis = "y";
  posX = 0;
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
    this.calcRealWidth(this._progressLine, this.totalWidth);
    this.calculateItemData(this._progressLine, this.totalSum);
  }

  onStart(event, index) {
    this.useHandle = true;
    this.freaze[index] = this.getPositionHandler(index);
  }

  onStop(event, index) {
    this._data = this._data.map((item) => {
        return {
          title: Date.now(),
          value: item.value
        };
    });

    this.posX = 0;
    this.freaze = [];
  }

  onMoveEnd(event, index) {
    this.useHandle = false;
  }

  onMoving(event, index) {
    if (this.posX !== event.x) {
        const differ = event.x - this.posX;
          this.itemsData = this.calculateItemsNumbersFromPerc(
              this.calcPers(index, differ),
              this.totalSum
          );
      this.posX = event.x;
    }
  }

  checkEdge(event) {
    // this.edge = event;
  }

  calculateItemsNumbersFromPerc(array, total) {
    return array.map((item, index) => {
      return {
        title: this.itemsData[index].title,
        ByPersentage: item,
        ByNumber: (item * total) / 100
      };
    });
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
          let trasformToPlus = -value;
          return item.ByPersentage - trasformToPlus;
        } else {
          let fff = -Positivedifference;
          return item.ByPersentage + fff;
        }
      });
    } else if (value > 0) {

      let howMuchAfterMeWithZero = this.itemsData.filter((item, filterIndex) => {
        if (filterIndex > index && item.ByPercentage <= 0) {
          return true;
        }
      }).length;

      arrforReturn = this.itemsData.map((item, indexMap) => {
        if (indexMap < index) {
          return item.ByPersentage;
        } else if (indexMap === index) {
          return item.ByPersentage + value;
        } else {

          return item.ByPersentage - (value / ((this.itemsData.length - 1 - index) - howMuchAfterMeWithZero));

        }
      });

    } else if (value === 0) {
      arrforReturn = this.itemsData.map(item => item.ByPersentage);
    }
    return arrforReturn;
  }

  calcPers(index, x) {
    let newPercange = (x / this.realWidth) * 100;
    let res = this.comunismCalculaction(index, newPercange);
    return res;
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

  leftConstr(index) {
    if (index === 0) {
      return 0;
    } else {
      return this.progressItemStartPosition(index);
    }
  }

  rightConstr(index) {
    if (index === this.itemsData.length - 2) {
      return this.totalWidth - this.progressItemStartPosition(index);
    } else {
      if (index === 0) {
        return (this.progressItemStartPosition(index + 2)) - this.handlerWidth;
      } else {
        let NexPos = this.progressItemStartPosition(index + 2);
        let MyPos = this.progressItemStartPosition(index);
        let res = NexPos - MyPos;
        return res - this.handlerWidth;
      }
    }
  }

  getConstraints(index) {
    return {
      left: `${this.leftConstr(index)}px`,
      width: `${this.rightConstr(index)}px`
    };
  }

  stylePositionHandler(index) {
    const startPosition = this.progressItemStartPosition(index);
    const handlerPosition = this.getPositionHandler(index);
    if (this.useHandle !== false) {
      return { left: this.freaze[index] ? this.freaze[index] : handlerPosition - startPosition + "px" };
    } else {
      return { left: handlerPosition - startPosition + "px" };
    }
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
