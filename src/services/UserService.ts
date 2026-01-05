import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { setUserRoleInCache, invalidateUserRoleCache } from '@/lib/cache';

type Role = "ADMIN" | "EDITOR" | "VIEWER";

export class UserService {
  /**
   * Update user role and invalidate cache
   */
  static async updateUserRole(email: string, newRole: Role): Promise<boolean> {
    try {
      await connectDB();
      
      const user = await User.findOneAndUpdate(
        { email },
        { role: newRole },
        { new: true }
      );

      if (user) {
        // Invalidate the old cache entry
        invalidateUserRoleCache(email);
        
        // Optionally set the new cache entry immediately
        setUserRoleInCache(email, newRole, user._id.toString());
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating user role:', error);
      return false;
    }
  }

  /**
   * Get user by email with caching
   */
  static async getUserByEmail(email: string) {
    try {
      await connectDB();
      return await User.findOne({ email });
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  /**
   * Invalidate cache for a specific user (useful for manual cache management)
   */
  static invalidateUserCache(email: string): void {
    invalidateUserRoleCache(email);
  }

  /**
   * Create a new user with role
   */
  static async createUser(userData: {
    name: string;
    email: string;
    image?: string;
    role?: Role;
  }) {
    try {
      await connectDB();
      
      // Check if this is the first user (make them admin)
      const userCount = await User.countDocuments();
      const isFirstUser = userCount === 0;
      
      const user = await User.create({
        name: userData.name,
        email: userData.email,
        image: userData.image || '',
        role: userData.role || (isFirstUser ? 'ADMIN' : 'VIEWER')
      });

      // Cache the new user
      setUserRoleInCache(userData.email, user.role, user._id.toString());
      
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
}