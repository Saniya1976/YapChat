import React, { useState } from "react";

/**
 * A robust Avatar component with loading states and graceful fallbacks.
 */
const Avatar = ({ src, alt, size = "size-12", className = "" }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // OPTIMIZATION: If the avatar is from a known slow provider (like iran.liara), swap it for DiceBear instantly
    let optimizedSrc = src;
    if (src?.includes("iran.liara.run")) {
        optimizedSrc = `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(alt || "random")}`;
    }

    const initials = alt
        ? alt
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "?";

    const imgRef = React.useRef(null);

    React.useEffect(() => {
        if (imgRef.current?.complete) {
            setIsLoading(false);
        }
    }, [optimizedSrc]);

    // Timeout: If image takes more than 3 seconds, fallback to initials
    React.useEffect(() => {
        if (isLoading) {
            const timer = setTimeout(() => {
                if (isLoading) {
                    setIsLoading(false);
                    setHasError(true);
                }
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isLoading, optimizedSrc]);

    return (
        <div className={`relative ${size} shrink-0 ${className} overflow-hidden rounded-full transition-all duration-300 shadow-sm bg-base-300`}>
            {/* Skeleton / Placeholder while loading */}
            {isLoading && !hasError && (
                <div className="absolute inset-0 bg-base-300 animate-pulse flex items-center justify-center rounded-full" />
            )}

            {/* Fallback Initial if error or no src */}
            {(hasError || !optimizedSrc) ? (
                <div className={`w-full h-full flex items-center justify-center bg-primary/10 border-2 border-primary/20 text-primary font-bold`}>
                    {initials}
                </div>
            ) : (
                <img
                    ref={imgRef}
                    src={optimizedSrc}
                    alt={alt}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"
                        }`}
                    onLoad={() => {
                        setIsLoading(false);
                    }}
                    onError={() => {
                        setIsLoading(false);
                        setHasError(true);
                    }}
                />
            )}
        </div>
    );
};

export default Avatar;
