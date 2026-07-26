const TIER_LIMITS = {
  1: {
    name: "Tier 1 (Starter)",
    maxGalaPrice: 1000,
    dailyWithdrawalLimit: 10000,
    monthlyWithdrawalLimit: 50000,
  }
};

const getTierLimits = () => {
  return TIER_LIMITS[1];
};

module.exports = { TIER_LIMITS, getTierLimits };
