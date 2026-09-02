import React, { useEffect, useState } from 'react';
import fallbackImage from '../../assets/service-placeholder.svg';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackSrc?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
    src,
    alt = '',
    fallbackSrc = fallbackImage,
    loading = 'lazy',
    decoding = 'async',
    onError,
    ...props
}) => {
    const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);
    const [hasFailed, setHasFailed] = useState(!src || src === fallbackSrc);

    useEffect(() => {
        setCurrentSrc(src || fallbackSrc);
        setHasFailed(!src || src === fallbackSrc);
    }, [src, fallbackSrc]);

    const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
        onError?.(event);
        if (!hasFailed && currentSrc !== fallbackSrc) {
            setHasFailed(true);
            setCurrentSrc(fallbackSrc);
        }
    };

    return (
        <img
            {...props}
            src={currentSrc}
            alt={alt}
            loading={loading}
            decoding={decoding}
            onError={handleError}
        />
    );
};
