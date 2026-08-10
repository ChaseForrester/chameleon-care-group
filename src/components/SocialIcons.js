/** Lightweight inline SVG social icons — no external icon font */

export function IconFacebook({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M22 12.07C22 6.48 17.52 2 11.93 2S1.86 6.48 1.86 12.07c0 5.02 3.66 9.18 8.44 9.93v-7.02H7.9v-2.91h2.4V9.84c0-2.37 1.41-3.68 3.56-3.68 1.03 0 2.11.18 2.11.18v2.33h-1.19c-1.17 0-1.54.73-1.54 1.48v1.78h2.62l-.42 2.91h-2.2V22c4.78-.75 8.44-4.91 8.44-9.93z" />
        </svg>
    );
}

export function IconInstagram({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
        </svg>
    );
}

export function IconGoogle({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
            <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
        </svg>
    );
}

export function IconStar({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            <path d="M12 2.5l2.9 6.1 6.7.9-4.9 4.6 1.3 6.6L12 17.8 5.9 20.7l1.3-6.6L2.4 9.5l6.7-.9L12 2.5z" />
        </svg>
    );
}

export function SocialLinks({ className = "", iconClassName = "", size = 20 }) {
    return (
        <div className={className}>
            <a
                href="https://www.facebook.com/chameleoncaregroup/"
                target="_blank"
                rel="noopener noreferrer"
                className={iconClassName}
                aria-label="Facebook"
                title="Facebook"
            >
                <IconFacebook size={size} />
            </a>
            <a
                href="https://www.instagram.com/chameleon_care_group/"
                target="_blank"
                rel="noopener noreferrer"
                className={iconClassName}
                aria-label="Instagram"
                title="Instagram"
            >
                <IconInstagram size={size} />
            </a>
            <a
                href="https://share.google/46T8pcFGRhDaphipj"
                target="_blank"
                rel="noopener noreferrer"
                className={iconClassName}
                aria-label="Google Business Profile"
                title="Google Business"
            >
                <IconGoogle size={size} />
            </a>
            <a
                href="https://g.page/r/CfVeH5GtaSdMEAI/review"
                target="_blank"
                rel="noopener noreferrer"
                className={`${iconClassName} review`.trim()}
                aria-label="Leave a Google review"
                title="Leave a review"
            >
                <IconStar size={size} />
            </a>
        </div>
    );
}
