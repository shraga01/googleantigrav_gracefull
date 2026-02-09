export interface Badge {
    _id: string;
    code: string;
    name: string;
    nameEn?: string;
    description: string;
    descriptionEn?: string;
    icon: string;
    category: 'milestone' | 'streak' | 'quality' | 'social';
    isUnlocked: boolean;
    awardedAt?: string;
    order: number;
}
