import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "app-range-slider",
  templateUrl: "./range-slider.component.html",
  styleUrls: ["./range-slider.component.scss"]
})
export class RangeSliderComponent implements OnInit {
  @Input() data: any;
  draggable = true;
  inBounds = true;
  edge = {
    top: true,
    bottom: true,
    left: true,
    right: true
  };
  useHandle = false;
  lockAxis = "y";
  position;
  movingOffset = { x: 0, y: 0 };
  endOffset = { x: 0, y: 0 };
  constructor() {}

  ngOnInit(): void {}
  onStart(event) {
    //console.log("started output:", event);
  }

  onStop(event) {
    //console.log("stopped output:", event);
  }

  onMoving(event) {
    this.movingOffset.x = event.x;
    this.movingOffset.y = event.y;
    console.log('Moving', event.x);
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
}
