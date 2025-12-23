import { CommuteMethod, CommuteAdvice } from "@/types";

export const calculateCommute = async (
  from: string,
  to: string,
  method: CommuteMethod
): Promise<CommuteAdvice> => {
  // Logic to calculate travel time and advice
  return {
    method,
    estimatedTime: 15,
    clothingRecommendation: "Normal attire",
  };
};
