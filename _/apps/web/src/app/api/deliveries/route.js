import sql from "@/app/api/utils/sql";

// GET - List all deliveries with emission data
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const vehicleType = searchParams.get("vehicle_type");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let queryString = `
      SELECT 
        d.*,
        o.customer_name,
        o.customer_phone,
        e.co2_emissions_kg,
        e.emission_factor
      FROM deliveries d
      LEFT JOIN orders o ON d.order_id = o.order_id
      LEFT JOIN emissions e ON d.delivery_id = e.delivery_id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      queryString += ` AND d.status = $${paramCount}`;
      params.push(status);
    }

    if (vehicleType) {
      paramCount++;
      queryString += ` AND d.vehicle_type = $${paramCount}`;
      params.push(vehicleType);
    }

    paramCount++;
    queryString += ` ORDER BY d.created_at DESC LIMIT $${paramCount}`;
    params.push(limit);

    paramCount++;
    queryString += ` OFFSET $${paramCount}`;
    params.push(offset);

    const deliveries = await sql(queryString, params);

    return Response.json({
      success: true,
      data: deliveries,
      count: deliveries.length,
    });
  } catch (error) {
    console.error("Error fetching deliveries:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// POST - Create new delivery and calculate emissions
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      order_id,
      shipment_id,
      origin_address,
      origin_city,
      origin_lat,
      origin_lng,
      destination_address,
      destination_city,
      destination_lat,
      destination_lng,
      distance_km,
      vehicle_type,
    } = body;

    // Validate required fields
    if (!order_id || !shipment_id || !distance_km || !vehicle_type) {
      return Response.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      );
    }

    // Emission factors (kg CO2 per km)
    const emissionFactors = {
      bike: 0.0,
      ev: 0.05,
      van: 0.18,
      truck: 0.27,
    };

    const emissionFactor = emissionFactors[vehicle_type];
    const co2Emissions = distance_km * emissionFactor;

    // Insert delivery and emission in transaction
    const result = await sql.transaction([
      sql`
        INSERT INTO deliveries (
          order_id, shipment_id, origin_address, origin_city, 
          origin_lat, origin_lng, destination_address, destination_city,
          destination_lat, destination_lng, distance_km, vehicle_type, status
        ) VALUES (
          ${order_id}, ${shipment_id}, ${origin_address}, ${origin_city},
          ${origin_lat}, ${origin_lng}, ${destination_address}, ${destination_city},
          ${destination_lat}, ${destination_lng}, ${distance_km}, ${vehicle_type}, 'pending'
        )
        RETURNING *
      `,
      sql`
        INSERT INTO emissions (
          delivery_id, vehicle_type, distance_km, co2_emissions_kg, emission_factor
        ) VALUES (
          (SELECT delivery_id FROM deliveries WHERE shipment_id = ${shipment_id}),
          ${vehicle_type}, ${distance_km}, ${co2Emissions}, ${emissionFactor}
        )
        RETURNING *
      `,
    ]);

    const delivery = result[0][0];
    const emission = result[1][0];

    // Award eco-points for green choices
    if (vehicle_type === "bike") {
      await sql`
        INSERT INTO eco_points (user_identifier, delivery_id, points_earned, action_type, description)
        VALUES (
          ${order_id}, ${delivery.delivery_id}, 50, 'zero_emission', 
          'Chose bike delivery - Zero emissions!'
        )
      `;
    } else if (vehicle_type === "ev") {
      await sql`
        INSERT INTO eco_points (user_identifier, delivery_id, points_earned, action_type, description)
        VALUES (
          ${order_id}, ${delivery.delivery_id}, 30, 'ev_delivery',
          'Selected electric vehicle delivery'
        )
      `;
    }

    return Response.json(
      {
        success: true,
        data: {
          delivery,
          emission,
          eco_points_awarded:
            vehicle_type === "bike" ? 50 : vehicle_type === "ev" ? 30 : 0,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating delivery:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
