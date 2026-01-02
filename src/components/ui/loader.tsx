import React from 'react';
import { cn } from '@/lib/utils';

interface LoaderProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const Loader: React.FC<LoaderProps> = ({ size = 'md', className }) => {
    const sizeClass = size === 'sm' ? 'loader-sm' : size === 'lg' ? 'loader-lg' : '';

    return (
        <div className={cn('loader', sizeClass, className)} />
    );
};

export default Loader;
