import React, { useState } from "react";
import {
  GoogleMap,
  Marker,
  LoadScript,
  Autocomplete,
} from "@react-google-maps/api";

// Map container styles
const containerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "15px",
};

// Default center (Delhi)
const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090,
};

function App() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [map, setMap] = useState(null);

  // Dummy bus data (later replace with backend API)
  const buses = [
    { id: 1, lat: 28.6139, lng: 77.2090, name: "Bus 101" },
    { id: 2, lat: 28.7041, lng: 77.1025, name: "Bus 102" },
    { id: 3, lat: 28.5355, lng: 77.3910, name: "Bus 103" },
  ];

  const handleSearch = () => {
    alert(
      `Searching buses from ${source} to ${destination} 🚍 (dummy for now)`
    );
    // Here you’ll call backend API to get nearest buses
  };

  return (
    <div className="App" style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1 style={{ color: "#2563eb" }}>🚌 Smart Bus Tracking System</h1>

      {/* Input Section */}
      <div
        style={{
          background: "#fff",
          padding: "15px",
          borderRadius: "10px",
          marginBottom: "20px",
          maxWidth: "500px",
        }}
      >
        <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY" libraries={["places"]}>
          {/* Source Input */}
          <Autocomplete
            onPlaceChanged={(place) =>
              setSource(document.getElementById("source").value)
            }
          >
            <input
              id="source"
              type="text"
              placeholder="Enter Source"
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            />
          </Autocomplete>

          {/* Destination Input */}
          <Autocomplete
            onPlaceChanged={(place) =>
              setDestination(document.getElementById("destination").value)
            }
          >
            <input
              id="destination"
              type="text"
              placeholder="Enter Destination"
              style={{
                width: "100%",
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            />
          </Autocomplete>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              background: "#2563eb",
              color: "#fff",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
            }}
          >
            Search Buses
          </button>
        </LoadScript>
      </div>

      {/* Map Section */}
      <LoadScript googleMapsApiKey="AIzaSyD3g6UdyFzFWqB9qQ_vUVw1VzMogcFgbXI">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={11}
          onLoad={(map) => setMap(map)}
        >
          {/* Bus Markers */}
          {buses.map((bus) => (
            <Marker
              key={bus.id}
              position={{ lat: bus.lat, lng: bus.lng }}
              label={bus.name}
            />
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

export default App;
