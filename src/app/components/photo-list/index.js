import Photo from '@/app/photo';

export default function PhotoList({ photos }) {
  return <div className="photo-list">
    {photos.map((p) => <Photo key={p.id} photo={p} />)}
  </div>
}
