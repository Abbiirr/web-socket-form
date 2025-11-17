/**
 * Mock Authentication Service (Pure Frontend)
 * Simulates magic link authentication without a backend
 * Demonstrates OAuth2 flow patterns entirely on the frontend
 */

import type {
  MagicLinkRequest,
  MagicLinkResponse,
  TokenResponse,
  UserProfile
} from '../types/auth.types';

const MAGIC_LINK_STORAGE_KEY = 'pending_magic_links';
const USERS_STORAGE_KEY = 'registered_users';
const TOKEN_EXPIRY_SECONDS = 3600; // 1 hour

interface PendingMagicLink {
  email: string;
  token: string;
  expiresAt: number;
  createdAt: number;
}

interface RegisteredUser {
  id: string;
  email: string;
  name: string;
  createdAt: number;
}

class MockAuthService {
  /**
   * Generate a mock JWT token
   */
  private generateMockJWT(email: string, userId: string): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const payload = {
      sub: userId,
      email: email,
      userId: userId,
      roles: ['user'],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + TOKEN_EXPIRY_SECONDS,
    };

    // Create a mock JWT (not cryptographically secure, for demo only)
    const base64Header = btoa(JSON.stringify(header));
    const base64Payload = btoa(JSON.stringify(payload));
    const mockSignature = btoa(`mock-signature-${email}-${Date.now()}`);

    return `${base64Header}.${base64Payload}.${mockSignature}`;
  }

  /**
   * Generate a random token
   */
  private generateToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Get or create user
   */
  private getOrCreateUser(email: string): RegisteredUser {
    const usersJSON = localStorage.getItem(USERS_STORAGE_KEY);
    const users: RegisteredUser[] = usersJSON ? JSON.parse(usersJSON) : [];

    let user = users.find(u => u.email === email);

    if (!user) {
      user = {
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email: email,
        name: email.split('@')[0],
        createdAt: Date.now(),
      };
      users.push(user);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }

    return user;
  }

  /**
   * Get pending magic links
   */
  private getPendingLinks(): PendingMagicLink[] {
    const linksJSON = localStorage.getItem(MAGIC_LINK_STORAGE_KEY);
    return linksJSON ? JSON.parse(linksJSON) : [];
  }

  /**
   * Save pending magic links
   */
  private savePendingLinks(links: PendingMagicLink[]): void {
    localStorage.setItem(MAGIC_LINK_STORAGE_KEY, JSON.stringify(links));
  }

  /**
   * Clean expired magic links
   */
  private cleanExpiredLinks(): void {
    const links = this.getPendingLinks();
    const now = Date.now();
    const validLinks = links.filter(link => link.expiresAt > now);
    this.savePendingLinks(validLinks);
  }

  /**
   * Request magic link (simulated)
   */
  async requestMagicLink(request: MagicLinkRequest): Promise<MagicLinkResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(request.email)) {
      throw new Error('Invalid email address');
    }

    this.cleanExpiredLinks();

    // Generate magic link token
    const token = this.generateToken();
    const expiresIn = 15 * 60 * 1000; // 15 minutes
    const expiresAt = Date.now() + expiresIn;

    const magicLink: PendingMagicLink = {
      email: request.email,
      token,
      expiresAt,
      createdAt: Date.now(),
    };

    // Store pending magic link
    const links = this.getPendingLinks();
    // Remove any existing links for this email
    const filteredLinks = links.filter(link => link.email !== request.email);
    filteredLinks.push(magicLink);
    this.savePendingLinks(filteredLinks);

    // In a real app, this would send an email
    // For demo, we'll store the link for the user to see
    console.log('Magic Link Generated:', {
      email: request.email,
      token,
      link: `${request.redirectUri}?token=${token}`,
      expiresIn: '15 minutes',
    });

    // Store in sessionStorage for demo purposes (to show in UI)
    sessionStorage.setItem('latest_magic_link', JSON.stringify({
      email: request.email,
      token,
      link: `${request.redirectUri}?token=${token}`,
    }));

    return {
      message: 'Magic link sent successfully',
      expiresIn: expiresIn / 1000, // seconds
    };
  }

  /**
   * Verify magic link token
   */
  async verifyMagicLink(token: string): Promise<TokenResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    this.cleanExpiredLinks();

    const links = this.getPendingLinks();
    const linkIndex = links.findIndex(link => link.token === token);

    if (linkIndex === -1) {
      throw new Error('Invalid or expired magic link');
    }

    const link = links[linkIndex];

    // Check if expired
    if (link.expiresAt < Date.now()) {
      // Remove expired link
      links.splice(linkIndex, 1);
      this.savePendingLinks(links);
      throw new Error('Magic link has expired');
    }

    // Get or create user
    const user = this.getOrCreateUser(link.email);

    // Generate tokens
    const accessToken = this.generateMockJWT(user.email, user.id);
    const refreshToken = this.generateToken();

    // Remove used magic link
    links.splice(linkIndex, 1);
    this.savePendingLinks(links);

    // Clear the session storage
    sessionStorage.removeItem('latest_magic_link');

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: TOKEN_EXPIRY_SECONDS,
    };
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const usersJSON = localStorage.getItem(USERS_STORAGE_KEY);
    const users: RegisteredUser[] = usersJSON ? JSON.parse(usersJSON) : [];

    const user = users.find(u => u.id === userId);

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: new Date(user.createdAt).toISOString(),
    };
  }

  /**
   * Refresh token (simulated)
   */
  async refreshToken(_refreshToken: string, email: string): Promise<TokenResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const usersJSON = localStorage.getItem(USERS_STORAGE_KEY);
    const users: RegisteredUser[] = usersJSON ? JSON.parse(usersJSON) : [];

    const user = users.find(u => u.email === email);

    if (!user) {
      throw new Error('Invalid refresh token');
    }

    // Generate new tokens
    const accessToken = this.generateMockJWT(user.email, user.id);
    const newRefreshToken = this.generateToken();

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
      token_type: 'Bearer',
      expires_in: TOKEN_EXPIRY_SECONDS,
    };
  }

  /**
   * Logout (simulated)
   */
  async logout(): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    // In a real app, would invalidate tokens on server
    console.log('User logged out');
  }

  /**
   * Get latest magic link (for demo UI)
   */
  getLatestMagicLink(): { email: string; token: string; link: string } | null {
    const linkJSON = sessionStorage.getItem('latest_magic_link');
    return linkJSON ? JSON.parse(linkJSON) : null;
  }
}

export default new MockAuthService();
