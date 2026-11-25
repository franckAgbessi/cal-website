export const formatDate = (value) => value ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value)) : '';

export const readingTime = (blocks) => {
  const words = (blocks || []).flatMap((block) => block.children || []).map((child) => child.text || '').join(' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
};

export const portableTextToString = (blocks) => Array.isArray(blocks)
  ? blocks.flatMap((block) => block.children || []).map((child) => child.text || '').join(' ')
  : (blocks || '');

export const headingId = (block) => portableTextToString([block]).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'section';
