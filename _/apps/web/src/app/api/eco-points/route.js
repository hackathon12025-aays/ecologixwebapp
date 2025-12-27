import sql from "@/app/api/utils/sql";

// GET - Get eco-points by user or overall leaderboard
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdentifier = searchParams.get("user");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (userIdentifier) {
      // Get points for specific user
      const userPoints = await sql`
        SELECT 
          SUM(points_earned) as total_points,
          COUNT(*) as total_actions,
          user_identifier
        FROM eco_points
        WHERE user_identifier = ${userIdentifier}
        GROUP BY user_identifier
      `;

      const recentActions = await sql`
        SELECT *
        FROM eco_points
        WHERE user_identifier = ${userIdentifier}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;

      return Response.json({
        success: true,
        data: {
          summary: userPoints[0] || {
            total_points: 0,
            total_actions: 0,
            user_identifier: userIdentifier,
          },
          recent_actions: recentActions,
        },
      });
    } else {
      // Get leaderboard
      const leaderboard = await sql`
        SELECT 
          user_identifier,
          SUM(points_earned) as total_points,
          COUNT(*) as total_actions,
          MAX(created_at) as last_action
        FROM eco_points
        GROUP BY user_identifier
        ORDER BY total_points DESC
        LIMIT ${limit}
      `;

      return Response.json({
        success: true,
        data: leaderboard,
      });
    }
  } catch (error) {
    console.error("Error fetching eco-points:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}

// POST - Award eco-points
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      user_identifier,
      delivery_id,
      points_earned,
      action_type,
      description,
    } = body;

    if (!user_identifier || !points_earned || !action_type) {
      return Response.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO eco_points (user_identifier, delivery_id, points_earned, action_type, description)
      VALUES (${user_identifier}, ${delivery_id || null}, ${points_earned}, ${action_type}, ${description || null})
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
    console.error("Error awarding eco-points:", error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
