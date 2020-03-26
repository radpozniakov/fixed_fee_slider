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

  colors = [
   '#C4D600',
   '#72BDE8',
   '#75C165',
   '#4098BE',
   '#FFCD00',
   '#ED8B00',
   '#DA291C',
   '#012169',
   '#BBBCBC'
  ];

  _data = [];
  _progressLine = [];
  freaze = [];
  useHandle = false;
  lockAxis = "y";
  posX = 0;

  oldValue = 0;

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
        const newPercange = (differ / this.realWidth) * 100;
        const value = newPercange  * this.totalSum / 100;
        const resultOfEqualCalc = this.equalCalculaction(index,  -value);
        const SumOfNumbers = resultOfEqualCalc.reduce((sum, current) => {
          return +sum + +current.ByNumber;
        }, 0);
        const difference = this.totalSum - SumOfNumbers;
        this.itemsData = resultOfEqualCalc.map((item, indexMap) => {
          if (index === indexMap) {
            const withCompensation = +item.ByNumber + difference;
            return {
              title: item.title,
              ByNumber: withCompensation,
              ByPersentage: (withCompensation / this.totalSum) * 100,
              empty: item.empty,
              locked: item.locked
            };
          } else {
            return {
              title: item.title,
              ByNumber: +item.ByNumber,
              ByPersentage: (item.ByNumber / this.totalSum) * 100,
              empty: item.empty,
              locked: item.locked
            };
          }
        });
      this.posX = event.x;
    }
  }

  checkEdge(event) {
    // this.edge = event;
  }

  equalCalculaction(index, value) {
    let arrforReturn;
    let minusAmount = 0;

    if (value > 0) {
      const homMuchAfterMe = this.itemsData.length - index - 1;
      const PositiveDifference = value / homMuchAfterMe;

      arrforReturn = this.itemsData.map((item, indexMap) => {
        if (indexMap < index) {
          return {
            title: item.title,
            ByNumber: +item.ByNumber,
            ByPersentage: 0,
            empty: item.empty,
            locked: item.locked
          };
        } else if (indexMap === index) {
          const numb = this.freaze[index] ? item.ByNumber - value : +item.ByNumber;
          return {
            title: item.title,
            ByNumber: +numb.toFixed(2),
            ByPersentage: 0,
            empty: item.empty,
            locked: item.locked
          };
        } else {
          const resNumber = +item.ByNumber + -(-PositiveDifference);
          return {
            title: item.title,
            ByNumber: resNumber,
            ByPersentage: 0,
            empty: item.empty,
            locked: item.locked
          };
        }
      });
    } else if (value < 0) {
      function calcMinus(DataArr, indexElement, freeze) {
        return DataArr.map((item, indexMap) => {
          let result = 0;
          const numberItem = +item.ByNumber;
          let partOfValue = value / ((DataArr.length - 1 - indexElement) - howMuchAfterMeWithZero);
          partOfValue = -partOfValue;

          if (indexMap < indexElement) {
            return {
              title: item.title,
              ByNumber: numberItem,
              ByPersentage: 0,
              empty: item.empty,
              locked: item.locked
            };
          } else if (indexMap === indexElement) {
            const numb = freeze[index] ? item.ByNumber - value : +item.ByNumber;
            return {
              title: item.title,
              ByNumber: numb,
              ByPersentage: 0,
              empty: item.empty,
              locked: item.locked
            };
          } else {
            if (numberItem <= 0) {
              return {
                title: item.title,
                ByNumber: 0,
                ByPersentage: 0,
                empty: item.empty,
                locked: item.locked
              };
            } else {
              if (minusAmount) {
                result = numberItem - partOfValue;
                result = result - minusAmount;
                minusAmount = 0;
              } else {
                result = numberItem - partOfValue;
              }
              if (result <= 0) {
                minusAmount = -result;
                return {
                  title: item.title,
                  ByNumber: 0,
                  ByPersentage: 0,
                  empty: item.empty,
                  locked: item.locked
                };
              } else {
                return {
                  title: item.title,
                  ByNumber: +result.toFixed(2),
                  ByPersentage: 0,
                  empty: item.empty,
                  locked: item.locked
                };
              }
            }
          }
        });
      }
      const howMuchAfterMeWithZero = this.itemsData.filter((item, filterIndex) => {
        if (filterIndex > index && item.ByNumber === 0) {
          return true;
        }
      }).length;
      arrforReturn = calcMinus(this.itemsData, index, this.freaze);

      if (minusAmount) {
        arrforReturn = calcMinus(this.itemsData, index, this.freaze);
      }

    } else if (value === 0) {
      arrforReturn = this.itemsData.map(item => {
       return {
         title: item.title,
         ByNumber: +item.ByNumber,
         ByPersentage: 0,
         empty: item.empty,
         locked: item.locked
        };
      });
    }
    minusAmount = 0;
    return arrforReturn;
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
        title: item.title,
        empty: item.empty,
        locked: item.locked
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

  getStyleProgress(index) {
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

  leftConstrain(index) {
    if (index === 0) {
      return 0;
    } else {
      return this.progressItemStartPosition(index);
    }
  }

  rightConstrain(index) {
    if (index === this.itemsData.length - 2) {
      return this.totalWidth - this.progressItemStartPosition(index);
    } else {
      if (index === 0) {
        return (this.progressItemStartPosition(index + 2)) - this.handlerWidth;
      } else {
        const NexPos = this.progressItemStartPosition(index + 2);
        const MyPos = this.progressItemStartPosition(index);
        const res = NexPos - MyPos;
        return res - this.handlerWidth;
      }
    }
  }

  getConstraints(index) {
    return {
      left: `${this.leftConstrain(index)}px`,
      width: `${this.rightConstrain(index)}px`
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

  onTotalChange(e) {
    this.totalSum = +e.value;
    this.itemsData = this.itemsData.map((item, index) => {
      return {
        ByPersentage: item.ByPersentage,
        ByNumber: item.ByPersentage * this.totalSum / 100,
        title: item.title,
        empty: item.empty,
        locked: item.locked
      };
    });
  }

  countryFocusIn(e) {
    this.oldValue = +e.target.value;
  }

  onChangeCountryValue(e, index, event) {
    const newValue = +event.target.value;
    const differ = +this.oldValue - +newValue;

    const resultOfEqualCalc = this.equalCalculaction(index, differ);

    this.totalSum = this.returnSumOfArray(resultOfEqualCalc);

    this.itemsData = resultOfEqualCalc.map(item => {
      return {
        title: item.title,
        ByNumber: +item.ByNumber,
        ByPersentage: (item.ByNumber / this.totalSum) * 100,
        empty: item.empty,
        locked: item.locked
      };
    });
  }

  returnSumOfArray(arr) {
    return arr.reduce((sum, current) => {
      return +sum + current.ByNumber;
    }, 0);
  }

  validation(field: HTMLInputElement) {
    field.value = field.value.replace(/\D/, "");
  }

  lockSwitcher(event, index) {
    if (!this.itemsData[index].empty) {
      this.itemsData = this.itemsData.map((item, Mapindex) => {
        return {
          title: item.title,
          ByNumber: +item.ByNumber,
          ByPersentage: item.ByPersentage,
          empty: item.empty,
          locked: index === Mapindex ? !item.locked : item.locked
        };
      });
    }

  }
}
