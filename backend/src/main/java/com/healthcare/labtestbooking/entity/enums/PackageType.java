package com.healthcare.labtestbooking.entity.enums;

public enum PackageType {
    AGE_BASED("Age-Based Health Packages"),
    GENDER_BASED("Gender-Specific Packages"),
    PROFESSION_BASED("Profession-Based Packages"),
    DISEASE_SPECIFIC("Disease Management Packages"),
    WELLNESS("Wellness & Lifestyle Packages"),
    PREVENTIVE("Preventive Health Packages"),
    CORPORATE("Corporate Health Packages"),
    FAMILY("Family Health Packages"),
    MEN("Men's Packages"),
    WOMEN("Women's Packages"),
    COUPLE("Couple Packages"),
    CHILD("Child Packages"),
    SENIOR_MEN("Senior Men Packages"),
    SENIOR_WOMEN("Senior Women Packages"),
    VITAMINS("Vitamin Packages");

    private final String displayName;

    PackageType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
