import React from 'react';

export type FluentIconName =
    | 'Fire' | 'Star' | 'Sparkles' | 'LightBulb' | 'Check' | 'Loading'
    | 'Home' | 'Book' | 'Chart' | 'User' | 'Settings' | 'Logout' | 'Globe'
    | 'Crown' | 'Handshake' | 'People' | 'Medal' | 'Coin' | 'Seedling';

interface FluentIconProps {
    name: FluentIconName;
    size?: number;
    className?: string;
    style?: React.CSSProperties;
}

const ICONS_MAP: Record<FluentIconName, string> = {
    // Stats & Highlights
    Fire: 'Travel%20and%20places/Fire.png',
    Star: 'Travel%20and%20places/Star.png',
    Sparkles: 'Activities/Sparkles.png',
    LightBulb: 'Objects/Light%20Bulb.png',
    Check: 'Activities/Direct%20Hit.png',
    Loading: 'Travel%20and%20places/Hourglass%20Not%20Done.png',
    Seedling: 'Animals/Seedling.png',

    // Navigation
    Home: 'Travel%20and%20places/House.png',
    Book: 'Objects/Open%20Book.png',
    Chart: 'Objects/Bar%20Chart.png',

    // Header
    User: 'People/Bust%20in%20Silhouette.png',
    Settings: 'Objects/Gear.png',
    Logout: 'Objects/Door.png',
    Globe: 'Travel%20and%20places/Globe%20Showing%20Europe-Africa.png',

    // Achievements
    Crown: 'Objects/Crown.png',
    Handshake: 'Hand%20gestures/Handshake.png',
    People: 'People/Busts%20in%20Silhouette.png',
    Medal: 'Activities/Sports%20Medal.png',
    Coin: 'Objects/Coin.png'
};

const BASE_URL = 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/';

export const FluentIcon: React.FC<FluentIconProps> = ({ name, size = 24, className = '', style = {} }) => {
    const url = `${BASE_URL}${ICONS_MAP[name]}`;

    return (
        <img
            src={url}
            alt={`${name} icon`}
            width={size}
            height={size}
            className={className}
            style={{
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
                ...style
            }}
            loading="lazy"
        />
    );
};
