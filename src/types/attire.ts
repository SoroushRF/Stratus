export interface ClothingPlan {
  outerwear: string;
  top: string;
  bottom: string;
  footwear: string;
  accessories: string[];
  rationale: string;
}

export interface AttireResponse {
  courses: Array<{
    name: string;
    time: string;
    weatherCondition: string;
    temperature: number;
    feelsLike: number;
    clothing: ClothingPlan;
  }>;
}
