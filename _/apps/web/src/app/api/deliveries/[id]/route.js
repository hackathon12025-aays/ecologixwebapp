import sql from "@/app/api/utils/sql";

// GET - Get single delivery with all details
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const deliveries = await sql`
      SELECT 
        d.*,
        o.customer_name,
        o.customer_phone,
        o.status as order_status,
        e.co2_emissions_kg,
        e.emission_factor,
        e.emission_id
      FROM deliveries d
      LEFT JOIN orders o ON d.order_id = o.order_id
      LEFT JOIN emissions e ON d.delivery_id = e.delivery_id
      WHERE d.delivery_id = ${parseInt(id)}
    `;

    if (deliveries.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Delivery not found",
        },
        { status: 404 },
      );
    }

    const delivery = deliveries[0];

    // Get eco-points for this delivery
    const ecoPoints = await sql`
      SELECT * FROM eco_points
      WHERE delivery_id = ${parseInt(id)}
      ORDER BY created_at DESC
    `;

    return Response.json({
      success: true,
      data: {
        ...delivery,
        eco_points: ecoPoints,
      },
    });
  } catch (error) {
    console.error("Error fetching delivery:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// PUT - Update delivery status
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, delivery_attempts } = body;

    const updates = [];
    const values = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      updates.push(`status = $${paramCount}`);
      values.push(status);

      if (status === "delivered") {
        paramCount++;
        updates.push(`completed_at = $${paramCount}`);
        values.push(new Date().toISOString());
      } else if (status === "failed") {
        paramCount++;
        updates.push(`failed_at = $${paramCount}`);
        values.push(new Date().toISOString());
      }
    }

    if (delivery_attempts !== undefined) {
      paramCount++;
      updates.push(`delivery_attempts = $${paramCount}`);
      values.push(delivery_attempts);
    }

    if (updates.length === 0) {
      return Response.json(
        {
          success: false,
          error: "No fields to update",
        },
        { status: 400 },
      );
    }

    paramCount++;
    values.push(parseInt(id));

    const queryString = `
      UPDATE deliveries
      SET ${updates.join(", ")}
      WHERE delivery_id = $${paramCount}
      RETURNING *
    `;

    const result = await sql(queryString, values);

    if (result.length === 0) {
      return Response.json(
        {
          success: false,
          error: "Delivery not found",
        },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error("Error updating delivery:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
