document.addEventListener("DOMContentLoaded", () => {
    const map = L.map("map").setView([51.505, -0.09], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);
  
    const pinList = document.getElementById("pin-list");
  
    // Load pins from localStorage
    const savedPins = JSON.parse(localStorage.getItem("pins")) || [];
    savedPins.forEach((pin) => addPinToSidebar(pin));
  
    // Map click event to add pin
    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      const pinMarker = L.marker([lat, lng]).addTo(map);
      const popupContent = document.createElement("div");
      popupContent.className = "popup-form";
  
      // Input for remarks
      const remarksInput = document.createElement("input");
      remarksInput.placeholder = "Enter remarks (optional)";
      popupContent.appendChild(remarksInput);
  
      // Submit button
      const submitButton = document.createElement("button");
      submitButton.innerText = "Save Pin";
      submitButton.onclick = () => savePin(lat, lng, remarksInput.value, pinMarker);
      popupContent.appendChild(submitButton);
  
      pinMarker.bindPopup(popupContent).openPopup();
    });
  
    function savePin(lat, lng, remarks, pinMarker) {
      fetchAddress(lat, lng).then((address) => {
        const pin = { lat, lng, remarks, address };
        savedPins.push(pin);
        localStorage.setItem("pins", JSON.stringify(savedPins));
        addPinToSidebar(pin);
        pinMarker.closePopup();
      });
    }
  
    function addPinToSidebar(pin) {
      const pinItem = document.createElement("div");
      pinItem.className = "pin-item";
      pinItem.innerHTML = `
        <strong>Remarks:</strong> ${pin.remarks || "N/A"} <br />
        <strong>Address:</strong> ${pin.address || "N/A"}
      `;
      pinItem.onclick = () => {
        map.setView([pin.lat, pin.lng], 13);
        L.marker([pin.lat, pin.lng]).addTo(map).openPopup();
      };
      pinList.appendChild(pinItem);
    }
  
    // Function to fetch address from Nominatim API
    function fetchAddress(lat, lng) {
      return fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
        .then((response) => response.json())
        .then((data) => data.display_name)
        .catch(() => "Address not found");
    }
  });
  