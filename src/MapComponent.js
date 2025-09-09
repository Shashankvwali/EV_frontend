import React from "react";
import { GoogleMap, Marker, LoadScript } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "12px",
  marginTop: "20px",
};

const center = {
  lat: 12.9716, // Default center (Bengaluru)
  lng: 77.5946,
};

function MapComponent({ stations }) {
  return (
    <LoadScript googleMapsApiKey="AIzaSyBQajpNZUTn80W1lUEtPa6KZu_8Vx2A0L4">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={12}
        center={center}
      >
        {stations.map((station) => (
          <Marker
            key={station.id}
            position={{ lat: station.lat, lng: station.lng }}
            title={station.name}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
}

export default MapComponent;
