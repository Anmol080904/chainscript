import React, { useState, useEffect } from 'react';
import { Tag, X } from 'lucide-react';
import api from '../api/api';

const PostTags = ({ postId }) => {
  const [allTags, setAllTags] = useState([]);
  const [postTags, setPostTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (postId) {
      fetchTagsData();
    }
  }, [postId]);

  const fetchTagsData = async () => {
    try {
      const [allTagsRes, postRes] = await Promise.all([
        api.get('/tags'),
        api.get(`/posts/${postId}`)
      ]);
      setAllTags(allTagsRes.data || []);
      setPostTags(postRes.data.data.tags || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = async (e) => {
    const tagId = e.target.value;
    if (!tagId) return;
    try {
      await api.post(`/posts/${postId}/tags`, { tag_id: tagId });
      // Add immediately to local state for fast UI
      const selectedTag = allTags.find(t => t.id === tagId);
      if (selectedTag) {
        setPostTags([...postTags, selectedTag]);
      }
    } catch (err) {
      alert("Error adding tag");
    }
  };

  const handleRemoveTag = async (tagId) => {
    try {
      await api.delete(`/posts/${postId}/tags/${tagId}`);
      setPostTags(postTags.filter(t => t.id !== tagId));
    } catch (err) {
      alert("Error removing tag");
    }
  };

  if (loading) return null; // Or a skeleton loader
  
  const unassignedTags = allTags.filter(t => !postTags.find(pt => pt.id === t.id));

  return (
    <div style={{ padding: '1rem', background: 'var(--surface-color)', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <Tag size={16} color="var(--primary-accent)" /> 
        <strong>Document Organization</strong>
        <select onChange={handleAddTag} value="" style={{ padding: '0.3rem', width: 'auto', marginLeft: 'auto' }}>
            <option value="" disabled>Assign Tag...</option>
            {unassignedTags.map(t => (
               <option key={t.id} value={t.id}>{t.name}</option>
            ))}
        </select>
      </div>
      <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
        {postTags.map(t => (
            <span key={t.id} style={{ background: 'var(--background-color)', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--surface-border)' }}>
               {t.name}
               <button onClick={() => handleRemoveTag(t.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  <X size={14} />
               </button>
            </span>
        ))}
        {postTags.length === 0 && <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>No tags assigned yet. Select one above.</span>}
      </div>
    </div>
  );
};

export default PostTags;
