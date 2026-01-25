/**
 * Time of Day Utility
 * Detects current time period and provides localized greetings
 */

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export interface TimeInfo {
    timeOfDay: TimeOfDay;
    isOptimalTime: boolean; // Evening is optimal for gratitude practice
    greeting: {
        english: string;
        hebrew: string;
    };
}

/**
 * Get the current time of day and related info
 * - Morning: 5:00 AM - 11:59 AM
 * - Afternoon: 12:00 PM - 4:59 PM
 * - Evening: 5:00 PM - 8:59 PM (OPTIMAL for practice)
 * - Night: 9:00 PM - 4:59 AM
 */
export function getTimeInfo(): TimeInfo {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return {
            timeOfDay: 'morning',
            isOptimalTime: false,
            greeting: {
                english: 'Good morning',
                hebrew: 'בוקר טוב'
            }
        };
    } else if (hour >= 12 && hour < 17) {
        return {
            timeOfDay: 'afternoon',
            isOptimalTime: false,
            greeting: {
                english: 'Good afternoon',
                hebrew: 'צהריים טובים'
            }
        };
    } else if (hour >= 17 && hour < 21) {
        return {
            timeOfDay: 'evening',
            isOptimalTime: true, // Best time for gratitude practice
            greeting: {
                english: 'Good evening',
                hebrew: 'ערב טוב'
            }
        };
    } else {
        return {
            timeOfDay: 'night',
            isOptimalTime: false,
            greeting: {
                english: 'Good night',
                hebrew: 'לילה טוב'
            }
        };
    }
}

/**
 * Get the time-of-day description for prompts
 */
export function getTimeDescription(timeOfDay: TimeOfDay, isHebrew: boolean): string {
    const descriptions = {
        morning: {
            english: 'morning',
            hebrew: 'בוקר'
        },
        afternoon: {
            english: 'afternoon',
            hebrew: 'צהריים'
        },
        evening: {
            english: 'evening',
            hebrew: 'ערב'
        },
        night: {
            english: 'night',
            hebrew: 'לילה'
        }
    };

    return isHebrew ? descriptions[timeOfDay].hebrew : descriptions[timeOfDay].english;
}
