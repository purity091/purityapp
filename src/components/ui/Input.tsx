import React from 'react';
import { cn } from '../../lib/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ className, label, error, ...props }) => {
    const generatedId = React.useId();
    const inputId = props.id || generatedId;
    return (
        <div className="space-y-1 md:space-y-2">
            {label && <label htmlFor={inputId} className="block text-[10px] font-bold text-gray-800 md:text-xs">{label}</label>}
            <input
                id={inputId}
                className={cn(
                    "flex h-10 w-full rounded-lg border border-gray-200 bg-gray-50/80 px-2.5 py-1.5 text-sm md:h-12 md:rounded-xl md:px-3.5 md:py-2 md:text-sm text-gray-900 font-medium placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
                    error && "border-red-500 focus:ring-red-500",
                    className
                )}
                {...props}
            />
            {error && <p className="text-[10px] font-medium text-red-500 md:text-xs">{error}</p>}
        </div>
    );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: { value: string; label: string }[];
    error?: string;
}

export const Select: React.FC<SelectProps> = ({ className, label, options, error, ...props }) => {
    const generatedId = React.useId();
    const selectId = props.id || generatedId;
    return (
        <div className="space-y-1 md:space-y-2">
            {label && <label htmlFor={selectId} className="block text-[10px] font-bold text-gray-800 md:text-xs">{label}</label>}
            <div className="relative">
                <select
                    id={selectId}
                    className={cn(
                        "flex h-10 w-full appearance-none rounded-lg border border-gray-200 bg-gray-50/80 px-2.5 py-1.5 text-sm md:h-12 md:rounded-xl md:px-3.5 md:py-2 md:text-sm text-gray-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
                        error && "border-red-500 focus:ring-red-500",
                        className
                    )}
                    {...props}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value} className="text-gray-900 font-medium py-1">
                            {opt.label}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-600 md:px-3">
                    <svg className="h-3.5 w-3.5 fill-current md:h-4 md:w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
            </div>
            {error && <p className="text-[10px] font-medium text-red-500 md:text-xs">{error}</p>}
        </div>
    );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ className, label, error, ...props }) => {
    const generatedId = React.useId();
    const textAreaId = props.id || generatedId;
    return (
        <div className="space-y-1 md:space-y-2">
            {label && <label htmlFor={textAreaId} className="block text-[10px] font-bold text-gray-800 md:text-xs">{label}</label>}
            <textarea
                id={textAreaId}
                className={cn(
                    "flex min-h-[64px] w-full rounded-lg border border-gray-200 bg-gray-50/80 px-2.5 py-1.5 text-sm md:min-h-[80px] md:rounded-xl md:px-3.5 md:py-2 md:text-sm text-gray-900 font-medium placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
                    error && "border-red-500 focus:ring-red-500",
                    className
                )}
                {...props}
            />
            {error && <p className="text-[10px] font-medium text-red-500 md:text-xs">{error}</p>}
        </div>
    );
};
