export interface AuthToken {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    refreshToken?: string;
}

export interface AuthUser {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
    email?: string;
}

export interface AuthResponse {
    token: string;
    user: AuthUser;
}
