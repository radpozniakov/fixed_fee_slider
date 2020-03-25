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
        const ress = newPercange  * this.totalSum / 100;

        const resultOfComunism = this.comunismCalculaction(index,  -ress);
        this.itemsData = resultOfComunism.map(item => {
          return {
            title: item.title,
            ByNumber: +item.ByNumber,
            ByPersentage: (item.ByNumber / this.totalSum) * 100,
          };
        });

      this.posX = event.x;
    }
  }

  checkEdge(event) {
    // this.edge = event;
  }

  comunismCalculaction(index, value) {
    //console.log(`index ${index}`, index);
    //console.log(`index ${value}`, value);
    //index = елемент который редактируется
    //value = сумма на которую нужно изменить текущий и относительно следующие (это не проценты %)

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
            ByPersentage: 0
          };
        } else if (indexMap === index) {
          const numb = this.freaze[index] ? item.ByNumber - value : +item.ByNumber;
          return {
            title: item.title,
            ByNumber: numb,
            ByPersentage: 0
          };
        } else {
          const resNumber = +item.ByNumber + -(-PositiveDifference);
          return {
            title: item.title,
            ByNumber: resNumber,
            ByPersentage: 0
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
              ByPersentage: 0
            };
          } else if (indexMap === indexElement) {
            const numb = freeze[index] ? item.ByNumber - value : +item.ByNumber;
            return {
              title: item.title,
              ByNumber: numb,
              ByPersentage: 0
            };
          }
          else {
            if (numberItem <= 0) {
              return {
                title: item.title,
                ByNumber: 0,
                ByPersentage: 0
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
                  ByPersentage: 0
                };
              } else {
                return {
                  title: item.title,
                  ByNumber: +result.toFixed(2),
                  ByPersentage: 0
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
         ByPersentage: 0
        };
      });
    }

    minusAmount = 0;
    return arrforReturn;

    // return arrforReturn.map((item) => {
    //   return +item.toFixed(2);
    // });
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
    // let sss = this.itemsData[index].ByNumber;
    const fff = (this.itemsData[index].ByPersentage * this.realWidth) / 100;
    //console.log(`progressItemWidth ${index}`, fff);
    return fff;
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

  onTotalChange(e) {
    this.totalSum = +e.value;
    this.itemsData = this.itemsData.map((item, index) => {
      return {
        ByPersentage: item.ByPersentage,
        ByNumber: item.ByPersentage * this.totalSum / 100,
        title: item.title
      };
    });
  }

  countryFocusIn(e) {
    this.oldValue = +e.target.value;
  }

  onChangeCountryValue(e, index, event) {
    const newValue = +event.target.value;
    const differ = +this.oldValue - +newValue;

    console.log('differ', differ);

    const resultOfComunism = this.comunismCalculaction(index, differ);

    this.totalSum = this.returnSumOfArray(resultOfComunism);
    this.itemsData = resultOfComunism.map(item => {
      return {
        title: item.title,
        ByNumber: +item.ByNumber,
        ByPersentage: (item.ByNumber / this.totalSum) * 100,
      };
    });
  }

  returnSumOfArray(arr) {
    return arr.reduce((sum, current) => {
      return +sum + current.ByNumber;
    }, 0);
  }

  returnSumOfCountries() {
    return this.itemsData.reduce((sum, current) => {
      return +sum + +current.ByNumber;
    }, 0);
  }

}
