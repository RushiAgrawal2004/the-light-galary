import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.ts';
import { fetchProfileByUserId, fetchMonitoredImagesByUserId, startMonitoringImage, updateInfringementMatchStatus } from '../services/mockApiService.ts';
import { Profile, MonitoredImage, PortfolioImage } from '../types.ts';
import { Shield, Search, Check, ExternalLink } from 'lucide-react';
import Button from '../components/Button.tsx';

const PortfolioShieldPage: React.FC = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [monitoredImages, setMonitoredImages] = useState<MonitoredImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedImageId, setExpandedImageId] = useState<string | null>(null);

    const loadData = async () => {
        if (user) {
            try {
                const [profileData, monitoredData] = await Promise.all([
                    fetchProfileByUserId(user.id),
                    fetchMonitoredImagesByUserId(user.id)
                ]);
                setProfile(profileData || null);
                setMonitoredImages(monitoredData);
            } catch (error) {
                console.error("Failed to load data:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        loadData();
    }, [user]);

    const handleStartMonitoring = async (imageId: string) => {
        if (!user) return;
        
        // Optimistically update UI
        const existing = monitoredImages.find(m => m.id === imageId);
        if (existing) {
            setMonitoredImages(monitoredImages.map(m => m.id === imageId ? {...m, status: 'Scanning'} : m));
        } else {
            setMonitoredImages([...monitoredImages, { id: imageId, userId: user.id, status: 'Scanning', matches: [] }]);
        }
        
        await startMonitoringImage(imageId, user.id);
        await loadData(); // Refresh from "source of truth"
    };

    const handleUpdateStatus = async (imageId: string, matchId: string) => {
        await updateInfringementMatchStatus(imageId, matchId, 'Reviewed');
        await loadData();
    }

    const getMonitoringStatus = (imageId: string) => {
        return monitoredImages.find(m => m.id === imageId);
    };
    
    if (loading) {
        return <div className="text-center py-20">Loading Portfolio Shield...</div>;
    }

    if (!profile) {
        return (
            <div className="container mx-auto px-6 py-12 text-center">
                <h2 className="text-2xl font-serif">Please create a profile to use Portfolio Shield.</h2>
                <Button to="/edit-profile" className="mt-4">Create Profile</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-12 max-w-4xl">
            <div className="text-center mb-12">
                <Shield className="mx-auto text-brand-primary mb-4" size={48} />
                <h1 className="text-4xl font-serif font-medium">Portfolio Shield</h1>
                <p className="text-lg text-brand-secondary mt-2">Monitor your images across the web for unauthorized use.</p>
            </div>

            <div className="space-y-8">
                {profile.portfolio.map((image: PortfolioImage) => {
                    const monitoringData = getMonitoringStatus(image.id);
                    const isScanning = monitoringData?.status === 'Scanning';
                    const isMonitored = monitoringData?.status === 'Monitored';
                    const matches = monitoringData?.matches || [];

                    return (
                        <div key={image.id} className="p-4 border border-brand-border">
                            <div className="flex items-center gap-6">
                                <img src={image.url} alt={image.caption} className="w-24 h-32 object-cover flex-shrink-0" />
                                <div className="flex-grow">
                                    <p className="font-semibold">{image.caption || "Untitled Image"}</p>
                                    <p className="text-xs text-brand-secondary">ID: {image.id}</p>
                                    {isMonitored && (
                                        <p className="text-sm text-green-700 font-medium mt-2">
                                            {matches.length} potential infringement{matches.length !== 1 ? 's' : ''} found.
                                        </p>
                                    )}
                                </div>
                                <div className="w-48 text-right">
                                    {!monitoringData && (
                                        <Button onClick={() => handleStartMonitoring(image.id)} variant="secondary" icon={<Search size={16} />}>
                                            Start Monitoring
                                        </Button>
                                    )}
                                    {isScanning && (
                                        <Button disabled className="cursor-wait">Scanning...</Button>
                                    )}
                                    {isMonitored && (
                                        <Button onClick={() => setExpandedImageId(expandedImageId === image.id ? null : image.id)}>
                                            {expandedImageId === image.id ? 'Hide Matches' : 'View Matches'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                            {isMonitored && expandedImageId === image.id && (
                                <div className="mt-4 pt-4 border-t border-brand-border">
                                    {matches.length > 0 ? (
                                        <ul className="space-y-2">
                                            {matches.map(match => (
                                                <li key={match.id} className="flex justify-between items-center p-2 bg-brand-background/50">
                                                    <a href={match.url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-primary hover:underline truncate flex-grow mr-4">
                                                        <ExternalLink size={14} className="inline mr-2" />
                                                        {match.url}
                                                    </a>
                                                    {match.status === 'Found' ? (
                                                        <button onClick={() => handleUpdateStatus(image.id, match.id)} className="text-xs font-semibold text-brand-secondary hover:text-brand-primary flex items-center gap-1">
                                                            <Check size={14} /> Mark as Reviewed
                                                        </button>
                                                    ) : (
                                                        <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                                                            <Check size={14} /> Reviewed
                                                        </span>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-center text-brand-secondary py-4">No potential infringements found in the last scan.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PortfolioShieldPage;
