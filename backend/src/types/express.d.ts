// src/types/express.d.ts
export { };

declare global {
    namespace Express {
        interface Request {
            user?: { userId: string };
            projectRole?: 'ADMIN' | 'MEMBER';
        }
    }
}