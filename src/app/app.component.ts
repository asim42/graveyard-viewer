import { Component, OnInit } from '@angular/core';
import { OverlayDataService } from './services/overlay-data.service';

import 'ol/ol.css';
import GeoJSON from 'ol/format/GeoJSON';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import Map from 'ol/Map';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Fill, Stroke, Style } from 'ol/style';
import View from 'ol/View';
import { getCenter } from 'ol/extent'

interface GraveyardData {
  type: string
  crs: {type: string, properties: any}
  features: Array<{type: string, geometry: {type: string, coordinates: Array<number>}, properties: {[x: string]: any}}>
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  map: Map
  title: string
  data: GraveyardData | undefined

  constructor(private overlayDataService: OverlayDataService) {
    this.map = new Map({})
    this.title = 'graveyard-viewer'
    this.data = undefined
  }

  get friedhofs () : string[] {
    if (this.data === undefined)
     return []
    return [...new Set(this.data.features.map((feature) => feature.properties['friedhof']))]
  }

  friedhofCoordinates (friedhof: string) : number[] {
    if (this.data === undefined)
      return []
    return this.data.features.filter(feature => feature.properties['friedhof'] === friedhof)
      .map((feature) => feature.geometry.coordinates)[0]
  }

  changeGrab (eventTarget: EventTarget | null) {
    if (eventTarget != null) {
      const selectEvent = eventTarget as HTMLInputElement
      console.log(selectEvent.value)
      if (this.data != undefined) {
        const geoJSON = new GeoJSON().readFeatures(this.data)
        const friedhofFeatures = geoJSON.filter(feature => feature.getProperties()['friedhof'] === selectEvent.value)
        const geometory = friedhofFeatures[300].getGeometry()
        if (geometory != undefined) {
          const extent = geometory.getExtent()
          const center = getCenter(extent)
          this.map.setView( new View({
            center: [center[0] , center[1]],
            zoom: 19
          }))
        }
      }
    }
  }

  ngOnInit(): void {
    this.overlayDataService.getData().subscribe((data: GraveyardData) => {

      this.data = data
      const styles = {
        'Belegt (Grab ist vergeben)': new Style({
          stroke: new Stroke({
            color: 'green',
            lineDash: [4],
            width: 3,
          }),
          fill: new Fill({
            color: 'rgba(0, 255, 0, 0.1)',
          }),
        }),
        'Freies Grab': new Style({
          stroke: new Stroke({
            color: 'red',
            lineDash: [4],
            width: 3,
          }),
          fill: new Fill({
            color: 'rgba(255, 0, 0, 0.1)',
          }),
        }),
        'Nutzungsrecht zurückgegeben': new Style({
          stroke: new Stroke({
            color: 'blue',
            lineDash: [4],
            width: 3,
          }),
          fill: new Fill({
            color: 'rgba(0, 0, 255, 0.1)',
          }),
        }),
        'Sonstiges': new Style({
          stroke: new Stroke({
            color: 'white',
            lineDash: [4],
            width: 3,
          }),
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.1)',
          }),
        }),
      };

      const styleFunction = function (feature: any) : Style {
        // https://stackoverflow.com/a/69198602/2732564
        return styles[feature.getProperties()['grabstatus'] as keyof typeof styles];
      };

      
      const geoJsonData = new GeoJSON().readFeatures(data)

      const vectorSource = new VectorSource({
        features: geoJsonData,
      });

      const vectorLayer = new VectorLayer({
        source: vectorSource,
        style: styleFunction,
      });

      this.map = new Map({
        view: new View({
          center: [0, 0],
          zoom: 1,
        }),
        layers: [
          new TileLayer({
            source: new OSM()
          }),
          vectorLayer,
        ],
        target: 'ol-map'
      });

    });
  }
}
