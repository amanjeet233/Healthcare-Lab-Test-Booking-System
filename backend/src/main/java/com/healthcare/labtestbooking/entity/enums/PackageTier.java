package com.healthcare.labtestbooking.entity.enums;

import java.math.BigDecimal;

public enum PackageTier {
    BASIC("Basic", new BigDecimal("10"), 5, 15),
    SILVER("Silver", new BigDecimal("20"), 15, 25),
    GOLD("Gold", new BigDecimal("30"), 25, 50),
    PLATINUM("Platinum", new BigDecimal("35"), 50, 100),
    DIAMOND("Diamond", new BigDecimal("40"), 75, 150),
    ADVANCED("Advanced", new BigDecimal("45"), 80, 200);

    private final String displayName;
    private final BigDecimal discountPercentage;
    private final int minTests;
    private final int maxTests;

    PackageTier(String displayName, BigDecimal discountPercentage, int minTests, int maxTests) {
        this.displayName = displayName;
        this.discountPercentage = discountPercentage;
        this.minTests = minTests;
        this.maxTests = maxTests;
    }

    public String getDisplayName() {
        return displayName;
    }

    public BigDecimal getDiscountPercentage() {
        return discountPercentage;
    }

    public int getMinTests() {
        return minTests;
    }

    public int getMaxTests() {
        return maxTests;
    }

    public static PackageTier fromTestCount(int testCount) {
        if (testCount >= DIAMOND.minTests) return DIAMOND;
        if (testCount >= PLATINUM.minTests) return PLATINUM;
        if (testCount >= GOLD.minTests) return GOLD;
        if (testCount >= SILVER.minTests) return SILVER;
        return BASIC;
    }
}
