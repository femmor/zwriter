import PostVersion, { IPostVersion } from '@/models/PostVersion';
import Post from '@/models/Post';
import { Types } from 'mongoose';

export class PostVersionService {
  /**
   * Create a new version of a post
   */
  static async createVersion(postId: string, content: string, userId: string): Promise<IPostVersion> {
    try {
      const version = await PostVersion.create({
        postId: new Types.ObjectId(postId),
        content,
        createdBy: new Types.ObjectId(userId),
      });
      return version;
    } catch (error) {
      throw new Error(`Failed to create post version: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get version history for a post
   */
  static async getVersionHistory(postId: string): Promise<IPostVersion[]> {
    try {
      return await PostVersion.find({ postId: new Types.ObjectId(postId) })
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });
    } catch (error) {
      throw new Error(`Failed to fetch version history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a specific version by its ID
   */
  static async getVersionById(versionId: string): Promise<IPostVersion | null> {
    try {
      return await PostVersion.findById(versionId).populate('createdBy', 'name email');
    } catch (error) {
      throw new Error(`Failed to fetch version: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Restore a post to a specific version
   */
  static async restoreVersion(postId: string, versionId: string, userId: string): Promise<boolean> {
    try {
      // Get the version to restore
      const version = await PostVersion.findById(versionId);
      if (!version) {
        throw new Error('Version not found');
      }

      // Verify the version belongs to the correct post
      if (version.postId.toString() !== postId) {
        throw new Error('Version does not belong to this post');
      }

      // Get the current post
      const post = await Post.findById(postId);
      if (!post) {
        throw new Error('Post not found');
      }

      // Create a version with the current content before restoring
      await this.createVersion(postId, post.content, userId);

      // Restore the content
      post.content = version.content;
      await post.save();

      return true;
    } catch (error) {
      throw new Error(`Failed to restore version: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Auto-version a post before making changes (middleware helper)
   */
  static async autoVersion(postId: string, currentContent: string, userId: string): Promise<IPostVersion | null> {
    try {
      // Only create a version if content is different from the last version
      const lastVersion = await PostVersion.findOne({ postId: new Types.ObjectId(postId) })
        .sort({ createdAt: -1 });

      if (lastVersion && lastVersion.content === currentContent) {
        return null; // No changes, skip versioning
      }

      return await this.createVersion(postId, currentContent, userId);
    } catch (error) {
      throw new Error(`Failed to auto-version post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}