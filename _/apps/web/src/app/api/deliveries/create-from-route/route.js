import sql from "@/app/api/utils/sql";

// Create delivery from calculated route data
export async function POST(request) {
  try {
    const {
      order_id,
      customer_name,
      customer_phone,
      route_data,
      vehicle_type,
    } = await request.json();

    if (!order_id || !customer_name || !route_data) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Generate shipment ID
    const shipmentId = `SHIP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Start transaction to create order and delivery
    const [orderResult, deliveryResult] = await sql.transaction([
      // Create or update order
      sql`
        INSERT INTO orders (order_id, customer_name, customer_phone, status)
        VALUES (${order_id}, ${customer_name}, ${customer_phone || null}, 'pending')
        ON CONFLICT (order_id) 
        DO UPDATE SET customer_name = ${customer_name}, customer_phone = ${customer_phone || null}
        RETURNING *
      `,

      // Create delivery
      sql`
        INSERT INTO deliveries (
          order_id, shipment_id, 
          origin_address, origin_city, origin_lat, origin_lng,
          destination_address, destination_city, destination_lat, destination_lng,
          distance_km, vehicle_type, status
        ) VALUES (
          ${order_id}, ${shipmentId},
          ${route_data.origin.address}, ${route_data.origin.city}, 
          ${route_data.origin.lat}, ${route_data.origin.lng},
          ${route_data.destination.address}, ${route_data.destination.city},
          ${route_data.destination.lat}, ${route_data.destination.lng},
          ${route_data.distance_km}, ${vehicle_type}, 'pending'
        )
        RETURNING *
      `,
    ]);

    const delivery = deliveryResult[0];

    // Calculate emissions
    const emissionFactors = {
      bike: 0.0,
      ev: 0.05,
      van: 0.18,
      truck: 0.27,
    };

    const emissionFactor = emissionFactors[vehicle_type] || 0.18;
    const co2Emissions = parseFloat(route_data.distance_km) * emissionFactor;

    // Insert emission record
    await sql`
      INSERT INTO emissions (
        delivery_id, vehicle_type, distance_km, 
        co2_emissions_kg, emission_factor
      )
      VALUES (
        ${delivery.delivery_id}, ${vehicle_type}, ${route_data.distance_km},
        ${co2Emissions}, ${emissionFactor}
      )
    `;

    // Award eco-points for green choices
    let ecoPoints = 0;
    let actionType = "";
    let description = "";

    if (vehicle_type === "bike") {
      ecoPoints = 50;
      actionType = "zero_emission";
      description = "Bike delivery - Zero emissions!";
    } else if (vehicle_type === "ev") {
      ecoPoints = 30;
      actionType = "ev_delivery";
      description = "Electric vehicle delivery - Low emissions!";
    }

    if (ecoPoints > 0) {
      await sql`
        INSERT INTO eco_points (
          user_identifier, delivery_id, points_earned, 
          action_type, description
        )
        VALUES (
          ${customer_name}, ${delivery.delivery_id}, ${ecoPoints},
          ${actionType}, ${description}
        )
      `;
    }

    // Fetch complete delivery with emissions and eco-points
    const completeDelivery = await sql`
      SELECT 
        d.*,
        o.customer_name, o.customer_phone,
        e.co2_emissions_kg, e.emission_factor,
        json_agg(
          json_build_object(
            'points_earned', ep.points_earned,
            'action_type', ep.action_type,
            'description', ep.description
          )
        ) FILTER (WHERE ep.point_id IS NOT NULL) as eco_points
      FROM deliveries d
      JOIN orders o ON d.order_id = o.order_id
      LEFT JOIN emissions e ON d.delivery_id = e.delivery_id
      LEFT JOIN eco_points ep ON d.delivery_id = ep.delivery_id
      WHERE d.delivery_id = ${delivery.delivery_id}
      GROUP BY d.delivery_id, o.customer_name, o.customer_phone, 
               e.co2_emissions_kg, e.emission_factor
    `;

    return Response.json({
      success: true,
      message: "Delivery created successfully",
      data: completeDelivery[0],
      route_info: {
        distance_km: route_data.distance_km,
        duration_minutes: route_data.duration_minutes,
        co2_emissions: co2Emissions,
        eco_points_earned: ecoPoints,
      },
    });
  } catch (error) {
    console.error("Error creating delivery:", error);
    return Response.json(
      { error: "Failed to create delivery", details: error.message },
      { status: 500 },
    );
  }
}
