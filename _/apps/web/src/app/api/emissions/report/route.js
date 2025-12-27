import sql from "@/app/api/utils/sql";

// GET - Generate emission reports
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const deliveryId = searchParams.get("delivery_id");
    const orderId = searchParams.get("order_id");
    const shipmentId = searchParams.get("shipment_id");
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    if (deliveryId) {
      // Single delivery report
      const report = await sql`
        SELECT 
          d.*,
          o.customer_name,
          e.co2_emissions_kg,
          e.emission_factor,
          e.created_at as emission_calculated_at
        FROM deliveries d
        LEFT JOIN orders o ON d.order_id = o.order_id
        LEFT JOIN emissions e ON d.delivery_id = e.delivery_id
        WHERE d.delivery_id = ${parseInt(deliveryId)}
      `;

      if (report.length === 0) {
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
        data: report[0],
      });
    }

    if (shipmentId) {
      // Report by shipment ID
      const report = await sql`
        SELECT 
          d.*,
          o.customer_name,
          e.co2_emissions_kg,
          e.emission_factor
        FROM deliveries d
        LEFT JOIN orders o ON d.order_id = o.order_id
        LEFT JOIN emissions e ON d.delivery_id = e.delivery_id
        WHERE d.shipment_id = ${shipmentId}
      `;

      if (report.length === 0) {
        return Response.json(
          {
            success: false,
            error: "Shipment not found",
          },
          { status: 404 },
        );
      }

      return Response.json({
        success: true,
        data: report[0],
      });
    }

    if (orderId) {
      // Report by order ID (may have multiple deliveries)
      const deliveries = await sql`
        SELECT 
          d.*,
          o.customer_name,
          e.co2_emissions_kg,
          e.emission_factor
        FROM deliveries d
        LEFT JOIN orders o ON d.order_id = o.order_id
        LEFT JOIN emissions e ON d.delivery_id = e.delivery_id
        WHERE d.order_id = ${orderId}
        ORDER BY d.created_at DESC
      `;

      const totalEmissions = deliveries.reduce(
        (sum, d) => sum + (parseFloat(d.co2_emissions_kg) || 0),
        0,
      );

      return Response.json({
        success: true,
        data: {
          order_id: orderId,
          deliveries,
          total_emissions: totalEmissions,
          delivery_count: deliveries.length,
        },
      });
    }

    // Date range report
    let queryString = `
      SELECT 
        d.*,
        o.customer_name,
        e.co2_emissions_kg,
        e.emission_factor
      FROM deliveries d
      LEFT JOIN orders o ON d.order_id = o.order_id
      LEFT JOIN emissions e ON d.delivery_id = e.delivery_id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (startDate) {
      paramCount++;
      queryString += ` AND d.created_at >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      queryString += ` AND d.created_at <= $${paramCount}`;
      params.push(endDate);
    }

    queryString += ` ORDER BY d.created_at DESC`;

    const deliveries = await sql(queryString, params);

    const totalEmissions = deliveries.reduce(
      (sum, d) => sum + (parseFloat(d.co2_emissions_kg) || 0),
      0,
    );

    const avgEmissions =
      deliveries.length > 0 ? totalEmissions / deliveries.length : 0;

    return Response.json({
      success: true,
      data: {
        deliveries,
        summary: {
          total_deliveries: deliveries.length,
          total_emissions: totalEmissions,
          avg_emissions_per_delivery: avgEmissions,
          start_date: startDate || null,
          end_date: endDate || null,
        },
      },
    });
  } catch (error) {
    console.error("Error generating emission report:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
