import React, { useState, useEffect } from 'react';
import { Tag, X, Layers } from 'lucide-react';
import api from '../api/api';
import { toast } from 'react-toastify';

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
        toast.info(`TAG ${selectedTag.name.toUpperCase()} LINKED.`);
      }
    } catch (err) {
      toast.error("ERROR_LINKING_METADATA");
    }
  };

  const handleRemoveTag = async (tagId) => {
    try {
      await api.delete(`/posts/${postId}/tags/${tagId}`);
      setPostTags(postTags.filter(t => t.id !== tagId));
      toast.info("METADATA_UNLINKED");
    } catch (err) {
      toast.error("UNLINKING_PROCESS_FAILED");
    }
  };

  if (loading) return null;
  
  const unassignedTags = allTags.filter(t => !postTags.find(pt => pt.id === t.id));

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Layers size={18} color="var(--primary-accent)" /> 
        <strong style={{ fontFamily: 'Orbitron', fontSize: '0.8rem', letterSpacing: '1px' }}>METADATA_LABELS</strong>
        <select onChange={handleAddTag} value="" style={{ padding: '0.4rem', width: 'auto', marginLeft: 'auto', fontSize: '0.75rem', fontFamily: 'Orbitron', margin: 0 }}>
            <option value="" disabled>ASSIGN_TAG...</option>
            {unassignedTags.map(t => (
               <option key={t.id} value={t.id}>{t.name.toUpperCase()}</option>
            ))}
        </select>
      </div>
      <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
        {postTags.map(t => (
            <span key={t.id} className="badge" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 0, 0, 0.05)' }}>
               {t.name.toUpperCase()}
               <button onClick={() => handleRemoveTag(t.id)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: 0, display: 'flex' }}>
                  <X size={12} />
               </button>
            </span>
        ))}
        {postTags.length === 0 && <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>NO_METADATA_ASSIGNED. SELECT_LABELS_ABOVE.</span>}
      </div>
    </div>
  );
};

export default PostTags;

