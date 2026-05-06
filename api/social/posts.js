// API endpoints for posts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  const { method } = req;
  
  switch (method) {
    case 'GET':
      return getPosts(req, res);
    case 'POST':
      return createPost(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getPosts(req, res) {
  try {
    const { type = 'for-you', userId, clubId, topicId, limit = 20, offset = 0 } = req.query;
    
    let query = supabase
      .from('posts')
      .select(`
        *,
        author:profiles(id, name, avatar_url, role),
        club:clubs(id, name, logo),
        topics:post_topics(topic:topics(*))
      `)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);
    
    // Filter by type
    if (type === 'following' && userId) {
      const { data: following } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', userId);
      
      const followingIds = following?.map(f => f.following_id) || [];
      query = query.in('author_id', followingIds);
    } else if (type === 'club' && clubId) {
      query = query.eq('club_id', clubId);
    } else if (type === 'topic' && topicId) {
      query = query
        .innerJoin('post_topics', 'posts.id', 'post_topics.post_id')
        .eq('post_topics.topic_id', topicId);
    }
    
    const { data: posts, error } = await query;
    
    if (error) throw error;
    
    return res.status(200).json({ posts: posts || [] });
  } catch (error) {
    console.error('Get posts error:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function createPost(req, res) {
  try {
    const { content, mediaUrls = [], visibility = 'public', topicIds = [], threadId = null, parentId = null } = req.body;
    const userId = req.headers['x-user-id']; // From auth middleware
    
    if (!content && mediaUrls.length === 0) {
      return res.status(400).json({ error: 'Content or media required' });
    }
    
    // Create post
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        author_id: userId,
        content,
        media_urls: mediaUrls,
        visibility,
        thread_id: threadId,
        parent_id: parentId,
        is_thread_root: !threadId && !parentId,
        thread_depth: parentId ? 1 : 0
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
    
    // Extract and create hashtags
    const hashtags = extractHashtags(content);
    for (const tag of hashtags) {
      const { data: existing } = await supabase
        .from('hashtags')
        .select('id')
        .eq('tag', tag)
        .single();
      
      if (!existing) {
        await supabase.from('hashtags').insert({ tag, normalized_tag: tag.toLowerCase() });
      }
    }
    
    return res.status(201).json({ post });
  } catch (error) {
    console.error('Create post error:', error);
    return res.status(500).json({ error: error.message });
  }
}

function extractHashtags(text) {
  const matches = text.match(/#(\w+)/g);
  return matches ? matches.map(tag => tag.slice(1)) : [];
}
