import { getServiceClient } from '../lib/supabase';

const supabase = getServiceClient();

export const socialService = {
  // Posts
  async getPosts({ type = 'for-you', userId, clubId, topicId, limit = 20, offset = 0 }) {
    let query = supabase
      .from('posts')
      .select(`
        *,
        author:profiles(id, name, avatar_url, role, club_id),
        club:clubs(id, name, logo),
        post_topics(topic:topics(id, name, slug, color))
      `)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);

    if (type === 'following' && userId) {
      const { data: following } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', userId);
      
      const followingIds = following?.map(f => f.following_id) || [];
      if (followingIds.length > 0) {
        query = query.in('author_id', followingIds);
      } else {
        return { posts: [] };
      }
    } else if (type === 'club' && clubId) {
      query = query.eq('club_id', clubId);
    } else if (topicId) {
      query = query
        .innerJoin('post_topics', 'posts.id', 'post_topics.post_id')
        .eq('post_topics.topic_id', topicId);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return { posts: data || [] };
  },

  async createPost({ content, mediaUrls = [], visibility = 'public', topicIds = [], threadId = null, parentId = null, clubId = null }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        author_id: user.id,
        club_id: clubId,
        content,
        media_urls: mediaUrls,
        visibility,
        thread_id: threadId,
        parent_id: parentId,
        is_thread_root: !threadId && !parentId,
        thread_depth: parentId ? 1 : 0,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;

    // Add topics
    if (topicIds.length > 0) {
      const topicLinks = topicIds.map((topicId, index) => ({
        post_id: post.id,
        topic_id: topicId,
        is_primary: index === 0
      }));
      
      await supabase.from('post_topics').insert(topicLinks);
    }

    // Handle hashtags
    await this.processHashtags(content, post.id);

    return { post };
  },

  async getPost(postId) {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(id, name, avatar_url, role),
        club:clubs(id, name, logo),
        post_topics(topic:topics(id, name, slug, color))
      `)
      .eq('id', postId)
      .single();

    if (error) throw error;
    return { post: data };
  },

  async deletePost(postId) {
    const { error } = await supabase
      .from('posts')
      .update({ deleted_at: new Date().toISOString(), status: 'deleted' })
      .eq('id', postId);

    if (error) throw error;
    return { success: true };
  },

  // Thread
  async getThread(threadId) {
    const { data: rootPost, error: rootError } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(id, name, avatar_url, role),
        club:clubs(id, name, logo),
        post_topics(topic:topics(id, name, slug, color))
      `)
      .eq('id', threadId)
      .single();

    if (rootError) throw rootError;

    const { data: replies, error: repliesError } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles(id, name, avatar_url, role)
      `)
      .eq('thread_id', threadId)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('thread_depth', { ascending: true })
      .order('created_at', { ascending: true });

    if (repliesError) throw repliesError;

    return { rootPost, replies: replies || [] };
  },

  // Interactions
  async likePost(postId) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('post_interactions')
      .upsert({
        post_id: postId,
        user_id: user.id,
        type: 'like'
      }, { onConflict: 'post_id,user_id,type' });

    if (error) throw error;
    return { success: true };
  },

  async unlikePost(postId) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('post_interactions')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .eq('type', 'like');

    if (error) throw error;
    return { success: true };
  },

  async repostPost(postId, quoteText = null) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('post_interactions')
      .insert({
        post_id: postId,
        user_id: user.id,
        type: quoteText ? 'quote' : 'repost',
        quote_text: quoteText,
        quote_post_id: quoteText ? postId : null
      });

    if (error) throw error;
    return { success: true };
  },

  async savePost(postId) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('post_interactions')
      .upsert({
        post_id: postId,
        user_id: user.id,
        type: 'save'
      }, { onConflict: 'post_id,user_id,type' });

    if (error) throw error;
    return { success: true };
  },

  async unsavePost(postId) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('post_interactions')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .eq('type', 'save');

    if (error) throw error;
    return { success: true };
  },

  async getPostInteractions(postId) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('post_interactions')
      .select('type, user_id')
      .eq('post_id', postId);

    if (error) throw error;

    const isLiked = data?.some(i => i.type === 'like' && i.user_id === user?.id) || false;
    const isSaved = data?.some(i => i.type === 'save' && i.user_id === user?.id) || false;
    const isReposted = data?.some(i => (i.type === 'repost' || i.type === 'quote') && i.user_id === user?.id) || false;

    return {
      likes: data?.filter(i => i.type === 'like').length || 0,
      reposts: data?.filter(i => i.type === 'repost' || i.type === 'quote').length || 0,
      saves: data?.filter(i => i.type === 'save').length || 0,
      isLiked,
      isSaved,
      isReposted
    };
  },

  // Topics
  async getTopics({ featured = false, trending = false, type = null } = {}) {
    let query = supabase
      .from('topics')
      .select('*')
      .eq('status', 'active')
      .order('posts_count', { ascending: false });

    if (featured) {
      query = query.eq('is_featured', true);
    }
    if (trending) {
      query = query.eq('is_trending', true);
    }
    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return { topics: data || [] };
  },

  async getTopic(slug) {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return { topic: data };
  },

  // Followers
  async followUser(userId) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('followers')
      .insert({
        follower_id: user.id,
        following_id: userId
      });

    if (error) throw error;
    return { success: true };
  },

  async unfollowUser(userId) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('followers')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', userId);

    if (error) throw error;
    return { success: true };
  },

  async getFollowers(userId) {
    const { data, error } = await supabase
      .from('followers')
      .select('follower_id, follower:profiles(id, name, avatar_url)')
      .eq('following_id', userId);

    if (error) throw error;
    return { followers: data || [] };
  },

  async getFollowing(userId) {
    const { data, error } = await supabase
      .from('followers')
      .select('following_id, following:profiles(id, name, avatar_url)')
      .eq('follower_id', userId);

    if (error) throw error;
    return { following: data || [] };
  },

  // Notifications
  async getNotifications({ limit = 20, offset = 0 } = {}) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        actor:profiles(id, name, avatar_url),
        post:posts(id, content, media_urls),
        topic:topics(id, name, slug)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { notifications: data || [] };
  },

  async markNotificationsAsRead() {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) throw error;
    return { success: true };
  },

  // Search
  async search({ q, type = 'all', limit = 20 }) {
    let results = {};

    if (type === 'all' || type === 'posts') {
      const { data: posts } = await supabase
        .from('posts')
        .select('*, author:profiles(id, name, avatar_url)')
        .textSearch('content', q)
        .eq('status', 'active')
        .limit(limit);
      results.posts = posts || [];
    }

    if (type === 'all' || type === 'users') {
      const { data: users } = await supabase
        .from('profiles')
        .select('id, name, avatar_url, role, club_id')
        .ilike('name', `%${q}%`)
        .limit(limit);
      results.users = users || [];
    }

    if (type === 'all' || type === 'topics') {
      const { data: topics } = await supabase
        .from('topics')
        .select('*')
        .ilike('name', `%${q}%`)
        .eq('status', 'active')
        .limit(limit);
      results.topics = topics || [];
    }

    return results;
  },

  // Helper methods
  async processHashtags(content, postId) {
    const hashtags = content.match(/#(\w+)/g) || [];
    
    for (const tag of hashtags) {
      const cleanTag = tag.slice(1).toLowerCase();
      
      // Get or create hashtag
      let { data: hashtag } = await supabase
        .from('hashtags')
        .select('id')
        .eq('normalized_tag', cleanTag)
        .single();

      if (!hashtag) {
        const { data: newHashtag } = await supabase
          .from('hashtags')
          .insert({ tag: cleanTag, normalized_tag: cleanTag })
          .select()
          .single();
        hashtag = newHashtag;
      }

      // Link hashtag to post
      await supabase
        .from('post_hashtags')
        .upsert({ post_id: postId, hashtag_id: hashtag.id }, 
          { onConflict: 'post_id,hashtag_id' });
    }
  },

  async getTrending({ type = 'all', limit = 10 } = {}) {
    let results = {};

    if (type === 'all' || type === 'topics') {
      const { data: topics } = await supabase
        .from('topics')
        .select('*')
        .eq('is_trending', true)
        .order('posts_count', { ascending: false })
        .limit(limit);
      results.topics = topics || [];
    }

    if (type === 'all' || type === 'posts') {
      const { data: posts } = await supabase
        .from('posts')
        .select('*, author:profiles(id, name, avatar_url)')
        .eq('status', 'active')
        .order('trending_score', { ascending: false })
        .limit(limit);
      results.posts = posts || [];
    }

    if (type === 'all' || type === 'hashtags') {
      const { data: hashtags } = await supabase
        .from('hashtags')
        .select('*')
        .order('trending_score', { ascending: false })
        .limit(limit);
      results.hashtags = hashtags || [];
    }

    return results;
  }
};
