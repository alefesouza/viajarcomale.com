export default function Photo({ photo }) {
  return <div className="photo">
    <img src={photo.url} alt={photo.description}></img>
  </div>
}
