# Task 4.1: Attire Recommendation Service - COMPLETE

## Overview
Created a dedicated AI-powered attire recommendation service that generates practical clothing advice based on class schedules and weather conditions.

## Implementation Details

### File: `src/lib/services/attire.ts`

**Key Features:**
1. **Separate from Schedule Parsing**: Uses its own Gemini instance, won't interfere with existing `gemini.ts`
2. **Model**: `gemini-2.0-flash-exp` with structured JSON output
3. **Dual-Mode Operation**:
   - AI-powered recommendations (primary)
   - Rule-based fallback (if AI fails)

### Functions

#### `generateAttireRecommendation(classInfo, weather)`
**Purpose:** Generate AI-powered clothing recommendation for a single class.

**Input:**
- `classInfo`: ParsedClass object
- `weather`: HourlyForecast object (or null)

**Output:** AttireRecommendation object
```typescript
{
  recommendation: "Warm jacket with layers",
  reasoning: "Temperature is 5°C with wind, layers allow indoor adjustment",
  accessories: ["Umbrella", "Scarf"],
  priority: "essential"
}
```

**AI Prompt Considerations:**
- Class duration (longer = more comfort focus)
- Time of day (morning/afternoon/evening)
- Campus practicality (walking, sitting, indoor heating)
- Canadian winter realities (wind chill, overheated classrooms)
- Layering strategy for indoor/outdoor transitions

#### `getBasicAttireRecommendation(weather)`
**Purpose:** Rule-based fallback recommendation.

**Logic:**
- Temperature ranges:
  - < 0°C: Heavy winter gear
  - 0-10°C: Warm jacket + layers
  - 10-20°C: Light jacket
  - > 20°C: Light clothing
- Weather conditions:
  - Rain/Drizzle: Add umbrella, waterproof jacket
  - Snow: Add waterproof boots, gloves
  - High wind (>20 km/h): Add windbreaker

### Type Definitions

Added to `src/types/index.ts`:
```typescript
export interface AttireRecommendation {
  recommendation: string;
  reasoning: string;
  accessories: string[];
  priority: "essential" | "suggested";
}
```

## Usage Example

```typescript
import { generateAttireRecommendation } from "@/lib/services/attire";

const classInfo = {
  name: "CPSC 110",
  startTime: "09:00",
  endTime: "10:30",
  location: "ICICS 246"
};

const weather = {
  hour: "09:00",
  temp: 5,
  feelsLike: 2,
  condition: "Clear",
  windSpeed: 15,
  humidity: 65
};

const recommendation = await generateAttireRecommendation(classInfo, weather);
console.log(recommendation);
// {
//   recommendation: "Layer with a warm sweater under a winter jacket...",
//   reasoning: "5°C with 15 km/h wind creates wind chill...",
//   accessories: ["Scarf", "Gloves"],
//   priority: "essential"
// }
```

## Error Handling

**Graceful Degradation:**
1. If AI call fails → Returns fallback recommendation
2. If weather is null → Uses generic campus advice
3. Never throws errors → Always returns valid AttireRecommendation

**Fallback Example:**
```typescript
{
  recommendation: "Dress for 5°C with clear conditions.",
  reasoning: "Unable to generate detailed recommendation.",
  accessories: [],
  priority: "suggested"
}
```

## Integration Notes

**Does NOT interfere with existing code:**
- ✅ Separate file from `gemini.ts`
- ✅ Uses different Gemini model instance
- ✅ Different prompt structure
- ✅ Different response format
- ✅ Can be called independently

**Ready for Phase 4.2:**
- Service is complete and tested
- Can now batch-process multiple classes
- Can generate master recommendations

## Testing Checklist

- [x] Service compiles without errors
- [x] Type definitions are centralized
- [x] Fallback logic handles edge cases
- [x] No conflicts with schedule parsing
- [ ] Integration with UI (Phase 4.2)
- [ ] Batch processing (Phase 4.2)
- [ ] Master recommendation (Phase 4.3)
