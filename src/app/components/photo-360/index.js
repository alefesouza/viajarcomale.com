import { FILE_DOMAIN } from '@/app/utils/constants';
import styles from './index.module.css';

export default function Photo360({ media }) {
  return (
    <div className={styles.panorama}>
      <div
        id="panorama"
        data-photo={FILE_DOMAIN + media.photo}
        data-thumbnail={FILE_DOMAIN + media.file}
        data-yaw={media.yaw}
      ></div>

      <span itemProp="contentUrl" content={FILE_DOMAIN + media.photo}></span>
      <span itemProp="thumbnailUrl" content={FILE_DOMAIN + media.file}></span>
      <span itemProp="width" content="11968"></span>
      <span itemProp="height" content="5984"></span>
    </div>
  );
}
