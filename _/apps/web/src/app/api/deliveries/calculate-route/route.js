import sql from "@/app/api/utils/sql";

// Google Maps APIs integration for real delivery data
export async function POST(request) {
  try {
    const { origin_address, destination_address, vehicle_type } =
      await request.json();

    if (!origin_address || !destination_address) {
      return Response.json(
        { error: "Origin and destination addresses are required" },
        { status: 400 },
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Google Maps API key not configured" },
        { status: 500 },
      );
    }

    // 1. Geocode origin address
    const originGeoResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(origin_address)}&key=${apiKey}`,
    );
    const originGeoData = await originGeoResponse.json();

    if (originGeoData.status !== "OK" || !originGeoData.results[0]) {
      return Response.json(
        { error: "Could not geocode origin address" },
        { status: 400 },
      );
    }

    const originLocation = originGeoData.results[0].geometry.location;
    const originCity = extractCity(originGeoData.results[0].address_components);

    // 2. Geocode destination address
    const destGeoResponse = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination_address)}&key=${apiKey}`,
    );
    const destGeoData = await destGeoResponse.json();

    if (destGeoData.status !== "OK" || !destGeoData.results[0]) {
      return Response.json(
        { error: "Could not geocode destination address" },
        { status: 400 },
      );
    }

    const destLocation = destGeoData.results[0].geometry.location;
    const destCity = extractCity(destGeoData.results[0].address_components);

    // 3. Calculate distance and duration using Distance Matrix API
    const distanceResponse = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLocation.lat},${originLocation.lng}&destinations=${destLocation.lat},${destLocation.lng}&mode=driving&key=${apiKey}`,
    );
    const distanceData = await distanceResponse.json();

    if (
      distanceData.status !== "OK" ||
      !distanceData.rows[0].elements[0].distance
    ) {
      return Response.json(
        { error: "Could not calculate distance" },
        { status: 400 },
      );
    }

    const distanceMeters = distanceData.rows[0].elements[0].distance.value;
    const distanceKm = (distanceMeters / 1000).toFixed(2);
    const durationSeconds = distanceData.rows[0].elements[0].duration.value;
    const durationMinutes = Math.round(durationSeconds / 60);

    // 4. Calculate emissions based on vehicle type
    const emissionFactors = {
      bike: 0.0,
      ev: 0.05,
      van: 0.18,
      truck: 0.27,
    };

    const emissionFactor = emissionFactors[vehicle_type] || 0.18;
    const co2Emissions = (parseFloat(distanceKm) * emissionFactor).toFixed(4);

    // 5. Calculate savings vs truck
    const truckEmissions = parseFloat(distanceKm) * 0.27;
    const carbonSaved = (truckEmissions - parseFloat(co2Emissions)).toFixed(4);

    // 6. Get route alternatives for different vehicles
    const alternatives = Object.entries(emissionFactors).map(
      ([type, factor]) => ({
        vehicle_type: type,
        emission_factor: factor,
        co2_emissions: (parseFloat(distanceKm) * factor).toFixed(4),
        carbon_saved: (
          truckEmissions -
          parseFloat(distanceKm) * factor
        ).toFixed(4),
        recommended: factor === Math.min(...Object.values(emissionFactors)),
      }),
    );

    return Response.json({
      success: true,
      data: {
        route: {
          origin: {
            address: originGeoData.results[0].formatted_address,
            city: originCity,
            lat: originLocation.lat,
            lng: originLocation.lng,
          },
          destination: {
            address: destGeoData.results[0].formatted_address,
            city: destCity,
            lat: destLocation.lat,
            lng: destLocation.lng,
          },
          distance_km: parseFloat(distanceKm),
          duration_minutes: durationMinutes,
        },
        selected_vehicle: {
          type: vehicle_type,
          emission_factor: emissionFactor,
          co2_emissions: parseFloat(co2Emissions),
          carbon_saved: parseFloat(carbonSaved),
        },
        alternatives,
      },
    });
  } catch (error) {
    console.error("Error calculating route:", error);
    return Response.json(
      { error: "Failed to calculate route", details: error.message },
      { status: 500 },
    );
  }
}

function extractCity(addressComponents) {
  const cityComponent = addressComponents.find(
    (component) =>
      component.types.includes("locality") ||
      component.types.includes("administrative_area_level_2"),
  );
  const stateComponent = addressComponents.find((component) =>
    component.types.includes("administrative_area_level_1"),
  );

  if (cityComponent && stateComponent) {
    return `${cityComponent.long_name}, ${stateComponent.short_name}`;
  } else if (cityComponent) {
    return cityComponent.long_name;
  }
  return "Unknown";
}
