import { Component, OnInit, Input, OnChanges, ViewChildren, QueryList, ElementRef } from "@angular/core";

@Component({
  selector: "app-range-slider",
  templateUrl: "./range-slider.component.html",
  styleUrls: ["./range-slider.component.scss"]
})
export class RangeSliderComponent implements OnInit, OnChanges {
  @Input() data: any;
  @ViewChildren("country") country: QueryList<ElementRef>;
  draggable = true;
  inBounds = true;
  edge = {
    top: true,
    bottom: true,
    left: true,
    right: true
  };
  _data = [];
  useHandle = false;
  lockAxis = "y";
  position;
  movingOffset = { x: 0, y: 0 };
  endOffset = { x: 0, y: 0 };
  constructor() {}

  ngOnInit(): void {
    console.log(this.country);
  }
  ngOnChanges() {
    if (this.data.length !== 0) {
      this.data.forEach(element => {
        this._data = element.coutry.slice(0, -1);
      });
    }
    console.log(this.country);
  }
  onStart(event) {
    //console.log("started output:", event);
  }

  onStop(event) {
    //console.log("stopped output:", event);
  }

  onMoving(event) {
    this.movingOffset.x = event.x;
    this.movingOffset.y = event.y;
    console.log("Moving", event.x);
    // console.log('', this.movingOffset);
    // console.log(this.endOffset);
  }

  checkEdge(event) {
    // this.edge = event;
    //console.log('edge:', event);
  }

  onMoveEnd(event) {
    this.endOffset.x = event.x;
    this.endOffset.y = event.y;
  }
  getStyleLine(item) {
    const elPosition = item.left + '%';
    const widthEl = item.width + '%';
    return {
      left: elPosition,
      width: widthEl,
      position: "absolute"
    };
  }
  getRefEl(index){
    console.log(index);
  }
}
