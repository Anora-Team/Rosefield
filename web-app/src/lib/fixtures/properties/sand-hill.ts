// Rosewood Sand Hill — property knowledge base.
// Schema per web-app/src/lib/types.ts PropertyKnowledge.
// Curated to match the demo scenarios in docs/02 §7 and the staff cockpit
// reference in docs/02 §3.

import type { PropertyKnowledge } from "@/lib/types";

export const sandHill: PropertyKnowledge = {
  property_id: "rosewood-sand-hill",
  name: "Rosewood Sand Hill",
  location: "Menlo Park, California (Sand Hill Road, west of Stanford)",
  sense_of_place:
    "Low oak-shaded ranch buildings folded into the foothills. A garden that holds California stillness — coastal-fog mornings, dry afternoon light — and a culinary terroir tilted toward Madera's hearth and the property's own herbs.",

  available_services: [
    {
      service: "Madera (signature restaurant)",
      status: "open",
      lead_time_minutes: 30,
      notes:
        "Private terrace bookable. Wood-fire kitchen. Sat AM brunch service; Sun PM most demanded slot for anniversary dinners.",
    },
    {
      service: "In-room dining",
      status: "open",
      lead_time_minutes: 12,
      notes:
        "Setup on private terraces routine. Tea service includes Longjing, sencha, aged pu-erh, gyokuro; pots warmed at request.",
    },
    {
      service: "Garden — main lawn and water feature",
      status: "open",
      notes:
        "Quietest 7–9am, before staff cross-traffic. Water feature cleaned daily 7:30; walkable from 7:45.",
    },
    {
      service: "Sense of Place Spa",
      status: "open",
      lead_time_minutes: 60,
      notes:
        "Couples and solo treatments. Quiet rooms available; herb-and-bay aromatherapy on request. Same-sex therapist requests honored.",
    },
    {
      service: "Housekeeping (terrace prep)",
      status: "open",
      lead_time_minutes: 15,
      notes:
        "Can open terrace doors, lay tea linen, set heaters for foggy mornings, refresh in-room flowers.",
    },
    {
      service: "Concierge desk",
      status: "open",
      notes:
        "Full coverage 6am – 11pm. Cantor Arts Center, Filoli, coastal drives, Stanford Dish — local index curated.",
    },
    {
      service: "Valet & transport",
      status: "open",
      lead_time_minutes: 10,
      notes: "House cars to Stanford / Cantor / SFO; child seats on request.",
    },
    {
      service: "Designated prayer / meditation room",
      status: "closed",
      notes:
        "GAP: no permanent prayer space designated. Workaround: a quiet suite (e.g. R210) can be held by concierge as a private quiet room with mat and water on request — but it is not advertised and not standardized.",
    },
  ],

  seasonal_calendar: [
    {
      date_range: "Mar 15 – Jun 10",
      label: "Late-spring coastal fog",
      notes:
        "Foggy mornings typical until ~10am; garden empty and cool. Light layer recommended for AM walks. Bay-laurel and rosemary in bloom around the herb garden.",
    },
    {
      date_range: "Jun 10 – Sep 30",
      label: "Dry summer",
      notes:
        "Hot bright afternoons; mornings remain cool. Outdoor dining favored after sunset; pool relevant.",
    },
    {
      date_range: "Oct 1 – Nov 15",
      label: "Harvest and clear nights",
      notes:
        "Madera sources from local growers; stargazing strong post-sunset.",
    },
    {
      date_range: "Nov 15 – Mar 14",
      label: "Wet winter, oak quiet",
      notes:
        "Rain possible; fireside reading corners active. Garden water feature winterized but walkable.",
    },
  ],

  cultural_resources: [
    {
      label: "Aged pu-erh in stock",
      detail:
        "2018 raw pu-erh and a 2010 cooked pu-erh, sourced through the tea program; gaiwan and pot service both available.",
    },
    {
      label: "Longjing (West Lake green)",
      detail:
        "Pre-Qingming Longjing kept refrigerated; for Hangzhou-origin guests, the most recognizable tea on the menu.",
    },
    {
      label: "Cantor Arts Center proximity",
      detail:
        "10 min drive. Rodin sculpture garden including The Burghers of Calais is open and free; quietest Saturday mornings.",
    },
    {
      label: "Filoli Gardens",
      detail:
        "20 min drive. Formal English garden with classical structure; resonant for guests reading Western archetypal register.",
    },
    {
      label: "Madera private terrace for two",
      detail:
        "Anniversary-ready private terrace; oak-fired menu; pre-arrange wine pairings or sparkling-tea pairings for non-alcoholic registers.",
    },
    {
      label: "In-house herbalist",
      detail:
        "Bay laurel, lemon verbena, rosemary, lavender — can be added to room turn-downs or tea service.",
    },
  ],

  local_knowledge: [
    "Saturday mornings at Cantor Arts Center are quietest before 11am; Rodin's Burghers of Calais is in the outdoor courtyard.",
    "Coupa Café on Stanford campus opens 7am; literary-leaning solo guests often pair it with the Cantor visit.",
    "Stanford Dish hike: 3.5 mi loop, dry-grass exposure; not recommended for quiet-energy guests or hot afternoons.",
    "Coastal drive (Highway 84 to San Gregorio) ~45 min west; foggy until midday in late spring.",
    "Coyote Point and Half Moon Bay nurseries for guests with garden interest.",
    "Madera's wood-fired bread is sourced from Manresa Bread on order; useful note for slow-breakfast guests.",
    "Local Jain / vegetarian sourcing exists through Sundara in Sunnyvale (caterer); not standing relationship but reachable.",
  ],

  staff_directory: [
    {
      team: "concierge",
      name: "Daniel Vargas",
      role: "Lead concierge, AM shift",
    },
    {
      team: "concierge",
      name: "Mei Tanaka",
      role: "Concierge, Mandarin/Japanese-speaking",
    },
    {
      team: "restaurant",
      name: "Chef Reyes",
      role: "Madera executive chef",
    },
    {
      team: "restaurant",
      name: "Émilie Brassard",
      role: "Madera maître d'",
    },
    {
      team: "in_room_dining",
      name: "Tomás Acuña",
      role: "In-room dining captain, AM",
    },
    {
      team: "housekeeping",
      name: "Aurora Salinas",
      role: "Housekeeping supervisor, AM",
    },
    {
      team: "garden",
      name: "Henry Okafor",
      role: "Head gardener",
    },
    {
      team: "spa",
      name: "Lin Wei",
      role: "Spa lead therapist",
    },
    {
      team: "valet",
      name: "Marco Bianchi",
      role: "Valet lead",
    },
    {
      team: "kitchen",
      name: "Sous-chef Patel",
      role: "Sous chef, dietary accommodations contact",
    },
  ],
};
