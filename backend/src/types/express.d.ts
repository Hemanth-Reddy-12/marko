declare global {
    namespace Express {
        interface Request {
            session?: {
                session: {
                    id: string;
                    userId: string;
                    token: string;
                    expiresAt: Date;
                    createdAt: Date;
                    updatedAt: Date;
                    ipAddress?: string | null | undefined;
                    userAgent?: string | null | undefined;
                };
                user: {
                    id: string;
                    name: string;
                    email: string;
                    emailVerified: boolean;
                    image?: string | null | undefined;
                    createdAt: Date;
                    updatedAt: Date;
                };
            };
            user?: {
                id: string;
                name: string;
                email: string;
                emailVerified: boolean;
                image?: string | null | undefined;
                createdAt: Date;
                updatedAt: Date;
            };
        }
    }
}

export {};
