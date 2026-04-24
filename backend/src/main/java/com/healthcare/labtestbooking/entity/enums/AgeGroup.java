package com.healthcare.labtestbooking.entity.enums;

public enum AgeGroup {
    PEDIATRIC(0, 18, "Pediatric (0-18)"),
    YOUNG_ADULT(18, 40, "Young Adult (18-40)"),
    MIDDLE_AGE(40, 60, "Middle Age (40-60)"),
    SENIOR(60, 150, "Senior (60+)"),
    ALL(0, 150, "All Ages");

    private final int minAge;
    private final int maxAge;
    private final String displayName;

    AgeGroup(int minAge, int maxAge, String displayName) {
        this.minAge = minAge;
        this.maxAge = maxAge;
        this.displayName = displayName;
    }

    public int getMinAge() {
        return minAge;
    }

    public int getMaxAge() {
        return maxAge;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static AgeGroup fromAge(int age) {
        if (age < 18) return PEDIATRIC;
        if (age < 40) return YOUNG_ADULT;
        if (age < 60) return MIDDLE_AGE;
        return SENIOR;
    }

    public boolean isApplicable(int age) {
        return age >= minAge && age < maxAge;
    }
}
