export default function getTypePath(type) {
  switch (type) {
    case 'story':
      return 'stories';
    case 'youtube':
      return 'videos';
    case 'short-video':
      return 'short-videos';
    case '360photo':
      return '360-photos';
    default:
      return 'posts';
  }
}
