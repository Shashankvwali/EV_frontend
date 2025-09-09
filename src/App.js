import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const stationsData = [
  {
    id: 1,
    name: "Thunderplus EV Charging Station",
    address: "RR Nagar, Bengaluru",
    status: "Available",
    eta: "5 mins away",
    lat: 12.925845,
    lng: 77.520464,
  },
  {
    id: 2,
    name: "ElectricPe Charging Station",
    address: "Jayanagar, Bengaluru",
    status: "Occupied",
    eta: "10 mins away",
    lat: 12.9342,
    lng: 77.5884,
  },
  {
    id: 3,
    name: "Kazam Charging Station",
    address: "Vijayanagar, Bengaluru",
    status: "Available",
    eta: "3 mins away",
    lat: 12.97194,
    lng: 77.532745,
  },
];

function App() {
  const [location, setLocation] = useState("");
  const [stations, setStations] = useState(
    stationsData.map((station) => ({ ...station, reserved: false }))
  );
  const [searchMessage, setSearchMessage] = useState("");
  const [timers, setTimers] = useState({});
  const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 });
  const mapRef = useRef(null);

  // Handle search
  const handleSearch = () => {
    const filtered = stationsData.filter((s) =>
      s.address.toLowerCase().includes(location.toLowerCase())
    );
    if (filtered.length === 0) {
      setSearchMessage(`Search "${location}" not found`);
    } else {
      setSearchMessage("");
    }
    setStations(
      (filtered.length ? filtered : stationsData).map((station) => ({
        ...station,
        reserved: false,
      }))
    );
  };

  // Handle reservation
  const handleReserve = (id) => {
    setStations((prev) =>
      prev.map((station) =>
        station.id === id ? { ...station, reserved: true } : station
      )
    );

    // Start 15-min timer (900 seconds)
    setTimers((prev) => ({ ...prev, [id]: 5 }));
  };

  // Handle cancel
  const handleCancel = (id) => {
    setStations((prev) =>
      prev.map((station) =>
        station.id === id ? { ...station, reserved: false } : station
      )
    );
    setTimers((prev) => {
      const newTimers = { ...prev };
      delete newTimers[id];
      return newTimers;
    });
  };

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const newTimers = { ...prev };
        Object.keys(newTimers).forEach((key) => {
          newTimers[key] -= 1;
          if (newTimers[key] <= 0) {
            handleCancel(parseInt(key));
            delete newTimers[key];
          }
        });
        return newTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        fontFamily: "Segoe UI, sans-serif",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
      }}
    >
      <header
        style={{
          backgroundColor: "#2f855a",
          padding: "20px 40px",
          color: "white",
        }}
      >
        <h1 style={{ margin: 0 }}>🔌 VoltGo</h1>
        <p style={{ margin: 0, fontSize: 14 }}>Smart EV Charging Finder</p>
      </header>

      <div style={{ padding: "30px 20px", maxWidth: 900, margin: "0 auto" }}>
        <section>
          <h2 style={{ marginBottom: 10 }}>🔍 Find Nearby Charging Stations</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FaMapMarkerAlt color="#2f855a" />
            <input
              type="text"
              placeholder="Enter location e.g., Jayanagar"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #ccc",
              }}
            />
            <button
              onClick={handleSearch}
              style={{
                backgroundColor: "#2f855a",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: 8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <FaSearch />
              Search
            </button>
          </div>
        </section>

        {searchMessage && (
          <p style={{ color: "#dc3545", marginTop: 20 }}>{searchMessage}</p>
        )}

        <section style={{ marginTop: 40 }}>
          {stations.map((station) => (
            <div
              key={station.id}
              style={{
                backgroundColor: "white",
                borderRadius: 12,
                padding: 20,
                marginBottom: 20,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "scale(1.01)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <h3 style={{ margin: 0 }}>{station.name}</h3>
              <p style={{ margin: "4px 0" }}>{station.address}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 20,
                    fontSize: 12,
                    backgroundColor:
                      station.status === "Available" ? "#d4edda" : "#f8d7da",
                    color:
                      station.status === "Available" ? "#155724" : "#721c24",
                  }}
                >
                  {station.status}
                </span>
                <span style={{ fontSize: 13, color: "#555" }}>
                  ETA: {station.eta}
                </span>
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                <button
                  onClick={() => handleReserve(station.id)}
                  disabled={station.status !== "Available" || station.reserved}
                  style={{
                    backgroundColor:
                      station.status !== "Available"
                        ? "#ccc"
                        : station.reserved
                        ? "#6c757d"
                        : "#2f855a",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    cursor:
                      station.status !== "Available" || station.reserved
                        ? "not-allowed"
                        : "pointer",
                    borderRadius: 6,
                  }}
                >
                  {station.reserved ? "Reserved" : "Reserve Slot"}
                </button>

                {station.reserved && (
                  <button
                    onClick={() => handleCancel(station.id)}
                    style={{
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      cursor: "pointer",
                      borderRadius: 6,
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>

              {station.reserved && timers[station.id] !== undefined && (
                <p style={{ marginTop: 8, fontWeight: "bold" }}>
                  Time left:{" "}
                  {Math.floor(timers[station.id] / 60)
                    .toString()
                    .padStart(2, "0")}
                  :{(timers[station.id] % 60).toString().padStart(2, "0")}
                </p>
              )}
            </div>
          ))}
        </section>

        {/* Map */}
        <div style={{ height: "400px", width: "100%", marginTop: 30 }}>
          <LoadScript googleMapsApiKey=" AIzaSyArKr6tMzb44sDxlZXzqG8M5l4mSCWHW8I">
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={mapCenter}
              zoom={12}
              onLoad={(map) => (mapRef.current = map)}
              onDragEnd={() => {
                if (mapRef.current) {
                  const newCenter = mapRef.current.getCenter();
                  setMapCenter({ lat: newCenter.lat(), lng: newCenter.lng() });
                }
              }}
            >
              {stations.map((station) => (
                <Marker
                  key={station.id}
                  position={{ lat: station.lat, lng: station.lng }}
                  label={station.name}
                />
              ))}
            </GoogleMap>
          </LoadScript>
        </div>
      </div>
    </div>
  );
}

export default App;
