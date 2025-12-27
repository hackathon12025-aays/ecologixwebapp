import sql from "@/app/api/utils/sql";

// GET - Dashboard statistics and emission trends
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");

    // Total deliveries and emissions
    const totalStats = await sql`
      SELECT 
        COUNT(DISTINCT d.delivery_id) as total_deliveries,
        SUM(e.co2_emissions_kg) as total_emissions,
        AVG(e.co2_emissions_kg) as avg_emissions_per_delivery,
        SUM(d.distance_km) as total_distance
      FROM deliveries d
      LEFT JOIN emissions e ON d.delivery_id = e.delivery_id
      WHERE d.created_at >= NOW() - INTERVAL '${days} days'
    `;

    // Emissions by vehicle type
    const emissionsByVehicle = await sql`
      SELECT 
        d.vehicle_type,
        COUNT(d.delivery_id) as delivery_count,
        SUM(e.co2_emissions_kg) as total_emissions,
        AVG(e.co2_emissions_kg) as avg_emissions,
        SUM(d.distance_km) as total_distance
      FROM deliveries d
      LEFT JOIN emissions e ON d.delivery_id = e.delivery_id
      WHERE d.created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY d.vehicle_type
      ORDER BY total_emissions DESC
    `;

    // Delivery status breakdown
    const statusBreakdown = await sql`
      SELECT 
        status,
        COUNT(*) as count
      FROM deliveries
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY status
    `;

    // Emission trends over time (daily)
    const emissionTrends = await sql`
      SELECT 
        DATE(d.created_at) as date,
        COUNT(d.delivery_id) as deliveries,
        SUM(e.co2_emissions_kg) as total_emissions,
        AVG(e.co2_emissions_kg) as avg_emissions
      FROM deliveries d
      LEFT JOIN emissions e ON d.delivery_id = e.delivery_id
      WHERE d.created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(d.created_at)
      ORDER BY date DESC
    `;

    // Failed deliveries (for re-attempt tracking)
    const failedDeliveries = await sql`
      SELECT 
        COUNT(*) as failed_count,
        SUM(delivery_attempts) as total_attempts,
        AVG(delivery_attempts) as avg_attempts
      FROM deliveries
      WHERE status = 'failed'
      AND created_at >= NOW() - INTERVAL '${days} days'
    `;

    // Total eco-points awarded
    const ecoPointsStats = await sql`
      SELECT 
        SUM(points_earned) as total_points,
        COUNT(DISTINCT user_identifier) as unique_users,
        action_type,
        COUNT(*) as action_count
      FROM eco_points
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY action_type
    `;

    // Carbon savings comparison (comparing current vehicle choices vs. if all were trucks)
    const carbonSavings = await sql`
      SELECT 
        SUM(e.co2_emissions_kg) as actual_emissions,
        SUM(d.distance_km * 0.27) as potential_truck_emissions,
        SUM(d.distance_km * 0.27 - e.co2_emissions_kg) as carbon_saved
      FROM deliveries d
      LEFT JOIN emissions e ON d.delivery_id = e.delivery_id
      WHERE d.created_at >= NOW() - INTERVAL '${days} days'
    `;

    return Response.json({
      success: true,
      data: {
        overview: totalStats[0],
        by_vehicle_type: emissionsByVehicle,
        by_status: statusBreakdown,
        emission_trends: emissionTrends,
        failed_deliveries: failedDeliveries[0],
        eco_points: ecoPointsStats,
        carbon_savings: carbonSavings[0],
        period_days: days,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
