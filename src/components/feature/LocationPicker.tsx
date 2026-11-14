import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { LocateFixed, MapPin, Maximize2, Minimize2 } from 'lucide-react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useLanguage } from '../../context/LanguageContext';

const DUBAI_CENTER: [number, number] = [25.2048, 55.2708];
// Service coverage polygon for the Dubai neighborhoods currently supported by Purity.
// This is intentionally tighter than a rectangular map bound so pins cannot be placed
// in neighboring emirates or outside the advertised service area.
const DUBAI_SERVICE_AREA: [number, number][] = [
    [24.785, 54.965],
    [24.760, 55.105],
    [24.785, 55.280],
    [24.870, 55.420],
    [24.980, 55.550],
    [25.120, 55.610],
    [25.270, 55.610],
    [25.370, 55.520],
    [25.390, 55.400],
    [25.360, 55.300],
    [25.350, 55.190],
    [25.300, 55.070],
    [25.220, 54.980],
    [25.100, 54.900],
];

const DUBAI_MAP_BOUNDS: [[number, number], [number, number]] = [[24.74, 54.88], [25.42, 55.65]];

const isInsideServiceArea = (latitude: number, longitude: number) => {
    let inside = false;

    for (let index = 0, previousIndex = DUBAI_SERVICE_AREA.length - 1; index < DUBAI_SERVICE_AREA.length; previousIndex = index++) {
        const [currentLatitude, currentLongitude] = DUBAI_SERVICE_AREA[index];
        const [previousLatitude, previousLongitude] = DUBAI_SERVICE_AREA[previousIndex];
        const crossesLatitude = (currentLatitude > latitude) !== (previousLatitude > latitude);
        if (!crossesLatitude) continue;

        const longitudeAtLatitude = ((previousLongitude - currentLongitude) * (latitude - currentLatitude))
            / (previousLatitude - currentLatitude) + currentLongitude;
        if (longitude < longitudeAtLatitude) inside = !inside;
    }

    return inside;
};

const serviceLocationIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

interface LocationPickerProps {
    latitude: number | null;
    longitude: number | null;
    onChange: (location: { latitude: number; longitude: number }) => void;
}

const MapClickHandler: React.FC<{ onChange: LocationPickerProps['onChange'] }> = ({ onChange }) => {
    useMapEvents({
        click: event => onChange({ latitude: event.latlng.lat, longitude: event.latlng.lng }),
    });
    return null;
};

const MapCenterUpdater: React.FC<{ latitude: number | null; longitude: number | null }> = ({ latitude, longitude }) => {
    const map = useMap();

    useEffect(() => {
        if (latitude !== null && longitude !== null) map.setView([latitude, longitude], Math.max(map.getZoom(), 15));
    }, [latitude, longitude, map]);

    return null;
};

const MapSizeUpdater: React.FC<{ isFullscreen: boolean }> = ({ isFullscreen }) => {
    const map = useMap();

    useEffect(() => {
        const refreshMapSize = () => map.invalidateSize({ pan: false });
        const firstRefresh = window.setTimeout(refreshMapSize, 0);
        const secondRefresh = window.setTimeout(refreshMapSize, 180);
        const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(refreshMapSize) : null;
        resizeObserver?.observe(map.getContainer());
        window.addEventListener('resize', refreshMapSize);
        return () => {
            window.clearTimeout(firstRefresh);
            window.clearTimeout(secondRefresh);
            resizeObserver?.disconnect();
            window.removeEventListener('resize', refreshMapSize);
        };
    }, [isFullscreen, map]);

    return null;
};

export const LocationPicker: React.FC<LocationPickerProps> = ({ latitude, longitude, onChange }) => {
    const { t } = useLanguage();
    const [locationError, setLocationError] = useState('');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isPlacementMode, setIsPlacementMode] = useState(false);
    const hasLocation = latitude !== null && longitude !== null;

    const handleLocationChange = (location: { latitude: number; longitude: number }) => {
        if (!isInsideServiceArea(location.latitude, location.longitude)) {
            setLocationError(t('locationWithinDubai'));
            return false;
        }
        setLocationError('');
        setIsPlacementMode(false);
        onChange(location);
        return true;
    };

    const useCurrentLocation = () => {
        if (!navigator.geolocation) {
            setLocationError(t('locationUnsupported'));
            return;
        }

        setLocationError('');
        navigator.geolocation.getCurrentPosition(
            position => handleLocationChange({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
            () => setLocationError(t('locationAccessFailed')),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
        );
    };

    const picker = (
        <div className={`${isFullscreen ? 'fixed inset-0 z-[100] h-[100dvh] w-screen overflow-hidden bg-white' : 'w-full space-y-2 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-2.5'}`}>
            <div className={`${isFullscreen ? 'absolute left-3 right-3 top-3 z-[1000] rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-2xl backdrop-blur md:left-6 md:right-6 md:top-6 md:p-4' : 'border-b border-gray-200/80 pb-2'}`}>
                <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-xs font-black text-gray-900"><MapPin size={14} className="text-primary-600" /> {t('exactLocation')}</p>
                    <p className="mt-1 text-[10px] font-semibold leading-4 text-gray-500">{t('mapInstructions')}</p>
                </div>
                <div className="mt-2 flex min-w-0 flex-wrap items-center gap-1.5">
                    <button type="button" onClick={() => setIsPlacementMode(true)} aria-pressed={isPlacementMode} className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-[10px] font-black transition ${isPlacementMode ? 'border-primary-600 bg-primary-700 text-white' : 'border-primary-200 bg-white text-primary-700 hover:bg-primary-50'}`} title={t('placePin')}><MapPin size={12} /> <span>{hasLocation ? t('movePin') : t('placePin')}</span></button>
                    <button type="button" onClick={useCurrentLocation} className="inline-flex items-center gap-1 rounded-lg border border-primary-200 bg-white px-2 py-1.5 text-[10px] font-black text-primary-700 transition hover:bg-primary-50" title={t('useMyLocation')}><LocateFixed size={12} /> <span>{t('useMyLocation')}</span></button>
                    <button type="button" onClick={() => setIsFullscreen(value => !value)} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[10px] font-black text-gray-700 transition hover:bg-gray-100" title={isFullscreen ? t('exit') : t('fullScreen')}>{isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />} <span>{isFullscreen ? t('exit') : t('fullScreen')}</span></button>
                </div>
            </div>

            <MapContainer center={DUBAI_CENTER} zoom={11} minZoom={10} maxBounds={DUBAI_MAP_BOUNDS} maxBoundsViscosity={1} scrollWheelZoom className={`${isFullscreen ? 'absolute inset-0 z-0 h-full w-full rounded-none' : 'h-56 w-full rounded-lg'} ${isPlacementMode ? 'cursor-crosshair' : ''}`} attributionControl>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapSizeUpdater isFullscreen={isFullscreen} />
                <MapClickHandler onChange={handleLocationChange} />
                <MapCenterUpdater latitude={latitude} longitude={longitude} />
                {hasLocation && <Marker
                    position={[latitude, longitude]}
                    icon={serviceLocationIcon}
                    draggable
                    eventHandlers={{
                        dragend: event => {
                            const position = (event.target as L.Marker).getLatLng();
                            const accepted = handleLocationChange({ latitude: position.lat, longitude: position.lng });
                            if (!accepted) (event.target as L.Marker).setLatLng([latitude, longitude]);
                        },
                    }}
                ><Popup>{t('selectedLocation')}</Popup></Marker>}
            </MapContainer>

            <div className={isFullscreen ? 'absolute bottom-3 left-3 right-3 z-[1000] rounded-xl border border-gray-200 bg-white/95 px-3 py-2 shadow-xl backdrop-blur md:bottom-6 md:left-6 md:right-6' : ''}>
                {isPlacementMode ? <p className="text-[10px] font-bold text-primary-700">{t('placePin')}</p> : hasLocation ? <p className="text-[10px] font-bold text-emerald-700">{t('selectedLocation')}: {latitude.toFixed(6)}, {longitude.toFixed(6)}</p> : <p className="text-[10px] font-bold text-amber-700">{t('pleasePlacePin')}</p>}
                {locationError && <p role="alert" className="text-[10px] font-semibold text-red-600">{locationError}</p>}
            </div>
        </div>
    );

    return isFullscreen ? createPortal(picker, document.body) : picker;
};
