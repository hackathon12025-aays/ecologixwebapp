A full-stack, real-time sustainability platform that measures, tracks, and reduces the carbon footprint of last-mile deliveries.
ast-mile delivery contributes significantly to urban carbon emissions.
Most delivery platforms optimize only for speed and cost, not environmental impact.

This platform introduces:
Delivery-wise carbon accounting
Emission transparency
Incentives for eco-friendly behavior
Data-driven sustainability decisions

1.Real-Time Route & Distance Tracking
Address search using OpenStreetMap (Nominatim)
Accurate routing using OSRM
Distance calculation based on actual road networks

2.Vehicle-Aware Carbon Emission Calculation
Bike, EV, Van, Truck
Emissions calculated per delivery using accepted industry averages
Dynamic recalculation on route or vehicle change

3.Failed Delivery & Reattempt Tracking
Carbon impact of failed deliveries
Emission amplification due to retries
Operational inefficiency insights

4.Delivery-Level Emission Reporting
Per-delivery emission breakdown
Aggregate carbon footprint
Historical analytics (planned)

5.Gamified Eco-Incentives
Eco-points for sustainable choices
Rewards for first-attempt successful deliveries
Behavioral nudging toward greener options

6.Recycling & Reuse Impact Visualization
Nearby recycling center discovery
Carbon savings from reuse and recycling actions
Sustainability awareness dashboard

Backend APIs:
/api/deliveries - Create deliveries, auto-calculate emissions, award eco-points
/api/deliveries/[id] - Get delivery details, update status
/api/dashboard/stats - Real-time dashboard analytics
/api/eco-points - Leaderboard and point tracking
/api/emissions/report - Generate emission reports by order/shipment/date
/api/recycling-centers - Find centers by location with radius search
/api/orders - Order management with emission totals

Test the live system:
View real-time dashboard stats refreshing every 10 seconds
Click on deliveries to see routes on Google Maps
Update delivery statuses (pending → in transit → delivered/failed)
Track failed deliveries and re-attempts
Check the eco-points leaderboard
Find recycling centers near any location

1./api/deliveries/calculate-route (POST)
Integrates with Google Maps APIs:
Geocoding API - Converts addresses to lat/lng
Distance Matrix API - Calculates real distance & duration
Returns formatted addresses, coordinates, distance, time, and emission alternatives

2./api/deliveries/create-from-route (POST)
Creates delivery with calculated route data:
Auto-generates unique shipment ID
Creates/updates order record
Inserts delivery with coordinates
Calculates and records emissions
Awards eco-points automatically
Returns complete delivery object