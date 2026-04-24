export interface TestParameter {
    name: string;
    normalRange: string;
    unit: string;
    description?: string;
}

export interface TestFAQ {
    question: string;
    answer: string;
}

export interface LifestyleTip {
    icon: string;
    title: string;
    description: string;
}

export interface CityPrice {
    city: string;
    price: number;
}

export interface LabTestResponse {
    id: number;
    testCode?: string;
    testName?: string;
    name?: string;
    slug?: string;
    category?: string;
    categoryName?: string;
    categoryId?: number;
    description?: string;
    shortDescription?: string;
    testType?: string;
    methodology?: string;
    unit?: string;
    normalRangeMin?: number;
    normalRangeMax?: number;
    normalRangeText?: string;
    price: number;
    originalPrice?: number;
    sampleType?: string;
    fastingRequired: boolean;
    fastingHours?: number;
    reportTimeHours?: number;
    turnaroundTime?: string;
    averageRating?: number;
    totalReviews?: number;
    isActive?: boolean;
    isTopBooked?: boolean;
    isTopDeal?: boolean;
    parametersCount?: number;
    recommendedFor?: string;
    discountPercent?: number;
    iconUrl?: string;
    isPackage?: boolean;
    isTrending?: boolean;
    createdAt?: string;
    updatedAt?: string;
    // Enhanced fields for detail page
    alternateNames?: string[];
    knownAbout?: string;
    detailedUnderstanding?: string;
    parameters?: TestParameter[];
    containsTests?: number;
    sampleCollectionMethod?: string;
    phlebotomistInfo?: string;
    faqs?: TestFAQ[];
    lifestyleTips?: LifestyleTip[];
    cityPrices?: CityPrice[];
    references?: string[];
    recentlyBooked?: number;
    similarTests?: LabTestResponse[];
    benefits?: string[];
    conditions?: string[];
    homeCollectionSteps?: string[];
}

export interface LabTestSearchParams {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    fastingRequired?: boolean;
    page?: number;
    size?: number;
    sort?: string;
}

export interface LabTestPageResponse {
    content: LabTestResponse[];
    pageable: unknown;
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: unknown;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}
