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
        this._data = element.items;
      });
    }
    this.realWidth = this.calcRealWidth(this._data, this.totalWidth);
    this.itemsData = this.calculateItemData(this._data, this.totalSum);
  }

  onStart(event, index) {
    this.useHandle = true;
    this.freaze[index] = this.getPositionHandler(index);
  }

  onStop() {
    this._data = this._data.map((item) => {
        return {
          title: Date.now(),
          value: item.value
        };
    });
    this.posX = 0;
    this.freaze = [];
  }

  onMoveEnd() {
    this.useHandle = false;
  }

  calcInMoving(differ, index) {
    const newPercange = (differ / this.realWidth) * 100;
    const value = newPercange  * this.totalSum / 100;
    const resultOfEqualCalc = this.equalCalculaction(index,  -value);

    const SumOfNumbers = resultOfEqualCalc.reduce((sum, current) => {
      return +sum + +current.ByNumber;
    }, 0);

    const difference = this.totalSum - SumOfNumbers;
    return resultOfEqualCalc.map((item, indexMap) => {
      if (index === indexMap) {
        const withCompensation = +item.ByNumber + difference;
        return {
          title: item.title,
          ByNumber: withCompensation < 0 ? 0 : withCompensation,
          ByPersentage: (withCompensation / this.totalSum) * 100,
          empty: item.empty,
          locked: item.locked,
          settings: item.settings
        };
      } else {
        return {
          title: item.title,
          ByNumber: +item.ByNumber,
          ByPersentage: (item.ByNumber / this.totalSum) * 100,
          empty: item.empty,
          locked: item.locked,
          settings: item.settings
        };
      }
    });
  }

  onMoving(event, index) {
    if (this.posX !== event.x) {
      const activeItemsAhead = this.itemsData.filter((filterItem, filterIndex) => {
        return filterIndex > index && filterItem.empty === false && filterItem.locked === false && filterItem.ByNumber > 0
      });

      const differ = event.x - this.posX;

      if (this.posX > 0) {
        if (activeItemsAhead.length) {
          this.itemsData = this.calcInMoving(differ, index);
        }
      } else {
        this.itemsData = this.calcInMoving(differ, index);
      }
      this.posX = event.x;
    }
  }

  checkEdge(event) {}

  equalCalculaction(index, value) {
    let arrforReturn;
    let minusAmount = 0;

    if (value > 0) {
      const homMuchAfterMe = this.itemsData.filter((item, indexFilter) => {
          return indexFilter > index && item.locked === false && item.empty === false;
      }).length;

      const PositiveDifference = value / homMuchAfterMe;

      arrforReturn = this.itemsData.map((item, indexMap) => {
        if (indexMap < index) {
          return {
            title: item.title,
            ByNumber: +item.ByNumber,
            ByPersentage: 0,
            empty: item.empty,
            locked: item.locked,
            settings: item.settings
          };
        } else if (indexMap === index) {
          const numb = this.freaze[index] ? item.ByNumber - value : +item.ByNumber;
          return {
            title: item.title,
            ByNumber: +numb < 0 ? 0 : +numb,
            ByPersentage: 0,
            empty: item.empty,
            locked: item.locked,
            settings: item.settings
          };
        } else {
          if (item.locked === true || item.empty === true) {
            return {
              title: item.title,
              ByNumber: item.ByNumber,
              ByPersentage: item.ByPersentage,
              empty: item.empty,
              locked: item.locked,
              settings: item.settings
            };
          } else {
            const resNumber = +item.ByNumber + -(-PositiveDifference);
            return {
              title: item.title,
              ByNumber: resNumber,
              ByPersentage: 0,
              empty: item.empty,
              locked: item.locked,
              settings: item.settings
            };
          }
        }
      });
    } else if (value < 0) {
      const howMuchAfterMeWithZero = this.itemsData.filter((item, filterIndex) => {
        if (filterIndex > index && (item.ByNumber === 0 || item.locked ===  true || item.empty === true ) ) {
          return true;
        }
      }).length;

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
              locked: item.locked,
              settings: item.settings
            };
          } else if (indexMap === indexElement) {
            const numb = freeze[index] ? item.ByNumber - value : +item.ByNumber;
            return {
              title: item.title,
              ByNumber: numb,
              ByPersentage: 0,
              empty: item.empty,
              locked: item.locked,
              settings: item.settings
            };
          } else {
            if (item.locked === true || item.empty === true) {
              return {
                title: item.title,
                ByNumber: item.ByNumber,
                ByPersentage: item.ByPersentage,
                empty: item.empty,
                locked: item.locked,
                settings: item.settings
              };
            } else {
              if (numberItem <= 0) {
                return {
                  title: item.title,
                  ByNumber: 0,
                  ByPersentage: 0,
                  empty: item.empty,
                  locked: item.locked,
                  settings: item.settings
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
                    locked: item.locked,
                    settings: item.settings
                  };
                } else {
                  return {
                    title: item.title,
                    ByNumber: +result.toFixed(2),
                    ByPersentage: 0,
                    empty: item.empty,
                    locked: item.locked,
                    settings: item.settings
                  };
                }
              }
            }
          }
        });
      }

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
         locked: item.locked,
         settings: item.settings
        };
      });
    }
    minusAmount = 0;
    return arrforReturn;
  }

  calcRealWidth(items, width) {
    const filledItems = items.filter(item => item.empty !== true);

    if (filledItems.length > 1) {
      return width - (filledItems.length - 1) * this.handlerWidth;
    } else {
      return width;
    }
  }

  calculateItemData(data, totalNumber) {
    return data.map(item => {
      return {
        ByPersentage: (item.value / totalNumber) * 100,
        ByNumber: item.value,
        title: item.title,
        empty: item.empty,
        locked: item.locked,
        settings: item.settings
      };
    });
  }

  progressItemWidth(index) {
    return this.itemsData[index].empty === true ? 0 : (this.itemsData[index].ByPersentage * this.realWidth) / 100;
  }

  progressItemStartPosition(index) {
    if (index === 0) return 0;
    let sum = 0;
    let i = 0;
    while (i < index) {
      if (this.itemsData[i].empty !== true) {
        sum = sum + this.progressItemWidth(i) + this.handlerWidth;
      }
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
    return this.progressItemStartPosition(index) + this.progressItemWidth(index);
  }

  leftConstrain(index) {
    return index === 0 ? 0 : this.progressItemStartPosition(index);
  }

  rightConstrain(index) {
    let handlerPosition = 0;

    const checkOthers = this.itemsData.filter((filterItem, filterIndex) => {
      return filterIndex > index && filterItem.locked === false && filterItem.ByNumber > 0;
    });

    if (checkOthers.length) {
      let i = 1;
      while (i <= this.itemsData.length) {
        if ( this.itemsData[index + i] && this.itemsData[index + i].empty === false) {
          handlerPosition = this.getPositionHandler(index + i);
          break;
        }
        i++;
      }
    } else {
      if ( this.itemsData[index] && this.itemsData[index].empty === false) {
        handlerPosition = this.getPositionHandler(index) + this.handlerWidth + 2;
      }
    }
   return handlerPosition - this.progressItemStartPosition(index);
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
      return {
        left: this.freaze[index] ? this.freaze[index] : handlerPosition - startPosition + "px"
      };
    } else {
      return {
        left: handlerPosition - startPosition + "px"
      };
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
        locked: item.locked,
        settings: item.settings
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
        locked: item.locked,
        settings: item.settings
      };
    });
  }

  returnSumOfArray(arr) {
    return arr.reduce((sum, current) => {
      return +sum + current.ByNumber;
    }, 0);
  }

  worksDataItems(data) {
    return data((item) => item.emty !== true);
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
          locked: index === Mapindex ? !item.locked : item.locked,
          settings: item.settings
        };
      });
    }
  }

  isDraggable(index) {
    if (this.itemsData[index].locked) {
      return false;
    } else {
      const lockedItemsAhead = this.itemsData.filter((item, indexFilter) => {
        return indexFilter > index && item.locked === true;
      }).length;

      const isDraggable = this.itemsData.length - index - lockedItemsAhead - 1;
      if (isDraggable > 0) {
        return true;
      } else {
        return false;
      }
    }
  }

  canIdenderhandler(index) {
    if (this.itemsData[index].empty === true) {
      return false;
    } else {
      const itemsInAhead = this.itemsData.filter((item, filterIndex) => {
          return filterIndex > index && item.empty !== true;
      }).length;
      if (itemsInAhead) {
        return true;
      } else {
        return false;
      }
    }
  }

  openOtherSettings() {
    console.log('opened other settings');
  }
}
