import Image from 'next/image';

export default function HomeButton({ text, url, image }) {
  return <a href={ url } target="_blank"
  className="list-group-item list-group-item-action">
    {image && <Image src={image} alt={text} width={48} height={48} />}
    {text}
  </a>
};
