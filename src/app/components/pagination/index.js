import useI18n from '@/app/hooks/use-i18n';
import Link from 'next/link';
import styles from './index.module.css';
import { ITEMS_PER_PAGE } from '@/app/utils/constants';

export default function Pagination({
  base,
  currentPage,
  pageNumber,
  total,
  textPosition,
  isGallery,
}) {
  const i18n = useI18n();

  let pages = Array.from({ length: pageNumber }, (_, i) => i + 1);

  let mobilePages = [];

  if (pageNumber <= 5) {
    mobilePages = pages;
  } else {
    if (currentPage === pageNumber) {
      mobilePages.push(currentPage - 2);
    }

    if (currentPage !== 1) {
      mobilePages.push(currentPage - 1);
    }

    mobilePages.push(currentPage);

    if (currentPage !== pageNumber) {
      mobilePages.push(currentPage + 1);
    }

    if (currentPage === 1) {
      mobilePages.push(currentPage + 2);
    }
  }

  const pageTotal = currentPage * ITEMS_PER_PAGE + 1;
  const totalText = (
    <div
      style={{
        marginTop: textPosition === 'bottom' ? 14 : 0,
        marginBottom: textPosition === 'top' ? 14 : 0,
      }}
    >
      {i18n('Showing')} {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
      {pageTotal < total ? pageTotal : total} {i18n('of')} {total} posts
    </div>
  );

  return (
    <div className={styles.pagination}>
      {!isGallery && textPosition === 'top' && totalText}

      <div className={styles.mobile_pagination}>
        <Link
          href={
            currentPage == 2 && !isGallery
              ? base.replace('/page/{page}', '')
              : base.replace('{page}', currentPage - 1)
          }
          scroll={false}
          className={currentPage == 1 ? styles.pagination_disabled : null}
          prefetch={false}
        >
          &lt;
        </Link>
        {currentPage > 2 && pageNumber > 5 && (
          <>
            <Link
              href={base.replace('/page/{page}', '')}
              className={styles.page_number}
              scroll={false}
            >
              1
            </Link>
            <a href="#" className={styles.skip} prefetch={false}>
              …
            </a>
          </>
        )}
        {mobilePages.length > 1 &&
          mobilePages.map((p) => (
            <Link
              key={p}
              href={
                p == 1 && !isGallery
                  ? base.replace('/page/{page}', '')
                  : base.replace('{page}', p)
              }
              className={
                styles.page_number +
                (p == currentPage ? ' ' + styles.page_number_active : '')
              }
              scroll={false}
              prefetch={false}
            >
              {p}
            </Link>
          ))}
        {currentPage < pageNumber - 2 && pageNumber > 5 && (
          <a href="#" className={styles.skip}>
            …
          </a>
        )}
        {currentPage < pageNumber - 1 && pageNumber > 5 && (
          <Link
            href={base.replace('{page}', pageNumber)}
            className={styles.page_number}
            scroll={false}
            prefetch={false}
          >
            {pageNumber}
          </Link>
        )}
        <Link
          href={base.replace('{page}', currentPage + 1)}
          scroll={false}
          className={
            currentPage == pageNumber ? styles.pagination_disabled : null
          }
          prefetch={false}
        >
          &gt;
        </Link>
      </div>
      <div className={styles.desktop_pagination}>
        <Link
          href={
            currentPage == 2 && !isGallery
              ? base.replace('/page/{page}', '')
              : base.replace('{page}', currentPage - 1)
          }
          scroll={false}
          className={currentPage == 1 ? styles.pagination_disabled : null}
          prefetch={false}
        >
          {i18n('Previous')}
        </Link>
        {pages.map((p) => (
          <Link
            key={p}
            href={
              p == 1 && !isGallery
                ? base.replace('/page/{page}', '')
                : base.replace('{page}', p)
            }
            className={
              styles.page_number +
              (p == currentPage ? ' ' + styles.page_number_active : '')
            }
            scroll={false}
            prefetch={false}
          >
            {p}
          </Link>
        ))}
        <Link
          href={base.replace('{page}', currentPage + 1)}
          scroll={false}
          className={
            currentPage == pageNumber ? styles.pagination_disabled : null
          }
          prefetch={false}
        >
          {i18n('Next')}
        </Link>
      </div>

      {!isGallery && textPosition === 'bottom' && totalText}
    </div>
  );
}
