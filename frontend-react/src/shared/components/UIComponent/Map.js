import React, { useRef, useEffect } from 'react';
 
import './Map.css';
 
const Map = props => {
  const mapRef = useRef();

  const { center, zoom } = props;

  useEffect(() => {
    new window.ol.Map({
        target: mapRef.current.id,
        layers: [
          new window.ol.layer.Tile({
            source: new window.ol.source.OSM()
          })
        ],
        view: new window.ol.View({
          center: window.ol.proj.fromLonLat([center.lng, center.lat]),
          zoom: zoom
        })
      });
  }, [center, zoom]);

  return <div className={`map ${props.className}`} id="map" ref={mapRef} style={props.style}>
         </div>
};
 
export default Map;
