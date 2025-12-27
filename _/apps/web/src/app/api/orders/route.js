import sql from "@/app/api/utils/sql";

// GET - List all orders
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const orders = await sql`
      SELECT 
        o.*,
        COUNT(d.delivery_id) as delivery_count,
        SUM(e.co2_emissions_kg) as total_emissions
      FROM orders o
      LEFT JOIN deliveries d ON o.order_id = d.order_id
      LEFT JOIN emissions e ON d.delivery_id = e.delivery_id
      GROUP BY o.order_id
      ORDER BY o.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    return Response.json({
      success: true,
      data: orders,
      count: orders.length,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// POST - Create new order
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      order_id,
      customer_name,
      customer_phone,
      status = "pending",
    } = body;

    if (!order_id || !customer_name) {
      return Response.json(
        {
          success: false,
          error: "Missing required fields: order_id and customer_name",
        },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO orders (order_id, customer_name, customer_phone, status)
      VALUES (${order_id}, ${customer_name}, ${customer_phone}, ${status})
      RETURNING *
    `;

    return Response.json(
      {
        success: true,
        data: result[0],
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
