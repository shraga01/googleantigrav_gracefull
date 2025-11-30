import React from 'react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storage';
import { Button } from '../common/Button';

export const SettingsMenu: React.FC = () => {
    const { userProfile, setLanguage, updateProfile } = useApp();
    const isHebrew = userProfile?.language === 'hebrew';

    const handleExport = () => {
        const data = StorageService.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `daily-appreciation-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleDelete = () => {
        if (confirm(isHebrew ? 'האם אתה בטוח? פעולה זו תמחק את כל הנתונים שלך לצמיתות.' : 'Are you sure? This will permanently delete all your data.')) {
            StorageService.clearAllData();
            window.location.reload();
        }
    };

    const toggleLanguage = () => {
        const newLang = isHebrew ? 'english' : 'hebrew';
        if (confirm(isHebrew ? 'החלפת שפה תדרוש טעינה מחדש. להמשיך?' : 'Switching language requires a reload. Continue?')) {
            setLanguage(newLang);
            // Force reload to apply direction changes cleanly if needed, though context handles it
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '30px', color: 'var(--color-primary)' }}>
                {isHebrew ? 'הגדרות' : 'Settings'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Profile Section */}
                <section>
                    <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>{isHebrew ? 'פרופיל' : 'Profile'}</h3>
                    <div style={{ padding: '16px', backgroundColor: 'var(--color-card-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                        <div style={{ marginBottom: '8px' }}>
                            <strong>{isHebrew ? 'שם:' : 'Name:'}</strong> {userProfile?.name || '-'}
                        </div>
                        {/* Add more profile fields here if needed */}
                    </div>
                </section>

                {/* Language Section */}
                <section>
                    <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>{isHebrew ? 'שפה' : 'Language'}</h3>
                    <Button variant="outline" onClick={toggleLanguage} fullWidth>
                        {isHebrew ? 'Switch to English' : 'עבור לעברית'}
                    </Button>
                </section>

                {/* Data Section */}
                <section>
                    <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>{isHebrew ? 'ניהול נתונים' : 'Data Management'}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <Button variant="secondary" onClick={handleExport} fullWidth>
                            {isHebrew ? 'ייצא נתונים' : 'Export Data'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleDelete}
                            fullWidth
                            style={{ borderColor: 'red', color: 'red' }}
                        >
                            {isHebrew ? 'מחק הכל' : 'Delete All Data'}
                        </Button>
                    </div>
                </section>

                {/* About Section */}
                <section style={{ marginTop: '20px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px' }}>
                    <p>Daily Appreciation App v1.0</p>
                    <p>{isHebrew ? 'נבנה באהבה' : 'Built with love'}</p>
                </section>
            </div>
        </div>
    );
};
