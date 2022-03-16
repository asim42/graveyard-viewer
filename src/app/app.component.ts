import { Component, OnInit } from '@angular/core';
import { OverlayDataService } from './services/overlay-data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'graveyard-viewer';

  constructor(private overlayDataService: OverlayDataService) { }

  ngOnInit(): void {
    this.overlayDataService.getData()
      .subscribe((data: any) => console.log(data));
  }
}
