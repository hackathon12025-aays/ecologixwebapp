import sql from "@/app/api/utils/sql";

// GET - Get recycling centers (optionally filter by location)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat"));
    const lng = parseFloat(searchParams.get("lng"));
    const radius = parseFloat(searchParams.get("radius") || "50"); // km
    const limit = parseInt(searchParams.get("limit") || "20");

    let centers;

    if (!isNaN(lat) && !isNaN(lng)) {
      // Find centers within radius using Haversine formula
      centers = await sql`
        SELECT 
          *,
          (
            6371 * acos(
              cos(radians(${lat})) 
              * cos(radians(lat)) 
              * cos(radians(lng) - radians(${lng})) 
              + sin(radians(${lat})) 
              * sin(radians(lat))
            )
          ) AS distance_km
        FROM recycling_centers
        HAVING distance_km <= ${radius}
        ORDER BY distance_km ASC
        LIMIT ${limit}
      `;
    } else {
      // Get all centers
      centers = await sql`
        SELECT *
        FROM recycling_centers
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    }

    return Response.json({
      success: true,
      data: centers,
      count: centers.length,
    });
  } catch (error) {
    console.error("Error fetching recycling centers:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
