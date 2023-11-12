'use client'

import Select, { components } from 'react-select';
import useI18nClient from '@/app/hooks/use-i18n-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import arrayShuffle from '@/app/utils/array-shuffle';
import { ITEMS_PER_PAGE } from '@/app/utils/constants';

export default function Autocomplete() {
  const router = useRouter()
  const i18n = useI18nClient();
  
  const featuredHashtags = [i18n('#food'), i18n('#observationdeck')];
  const featuredOptions = featuredHashtags.map((item) => ({ label: item, value: item }));
  const [allOptions, setAllOptions] = useState(featuredOptions);
  const [allHashtags, setAllHashtags] = useState(featuredOptions);
  const [randomHashtags, setRandomHashtags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customStyle, setCustomStyles] = useState({});
  const [text, setText] = useState('');

  const updateRandomHashtags = (hashtags) => {
    const array = Array.from(Array(hashtags.length).keys());
    const randomArray = arrayShuffle(array).slice(0, ITEMS_PER_PAGE);
    const randomHashtags = randomArray.map((i) => hashtags[i]);
    
    setRandomHashtags(randomHashtags);
    setAllOptions([...featuredOptions, ...randomHashtags]);
  }

  const updateHashtags = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    if (today === localStorage.getItem('hashtags_updated')) {
      const hashtags = JSON.parse(localStorage.getItem('hashtags'))
        .map(h => ({ label: '#' + h, value: '#' + h }));
      setAllHashtags(hashtags);

      if (!randomHashtags.length) {
        updateRandomHashtags(hashtags);
      }
      return;
    }

    setIsLoading(true);

    const result = await fetch('/api/hashtags');
    const data = await result.text();

    const hashtags = JSON.parse(data).map(h => ({ label: '#' + h, value: '#' + h }));
    setAllHashtags([...featuredOptions, ...hashtags]);

    localStorage.setItem('hashtags', data);
    localStorage.setItem('hashtags_updated', new Date().toISOString().split('T')[0]);
    updateRandomHashtags(hashtags);

    setIsLoading(false);
  }

  const onChange = (e) => {
    if (window.location.pathname === '/hashtags/' + e.value.replace('#', '')) {
      return;
    }

    document.querySelector('#loader-spinner').style.display = 'block';

    router.push('/hashtags/' + e.value.replace('#', ''));
  }

  const onInputChange = (e) => {
    setText(e);

    if (e.length <= 1) {
      setAllOptions([...featuredOptions, ...randomHashtags])
      return;
    }
  
    setAllOptions(allHashtags);
  }

  const onFocus = () => {
    updateHashtags();
  }

  useEffect(() => {
    if (!navigator.windowControlsOverlay) {
      return;
    }

    const theCustomStyles = {
      control: base => ({
        ...base,
        height: 35,
        minHeight: 35
      })
    };

    const isOverlayVisible = navigator.windowControlsOverlay.visible;

    if (isOverlayVisible) {
      setCustomStyles(theCustomStyles);
    }

    const geometrychange = () => {
      const isOverlayVisible = navigator.windowControlsOverlay.visible;
  
      if (isOverlayVisible) {
        setCustomStyles(theCustomStyles);
        return;
      }

      setCustomStyles({});
    };

    navigator.windowControlsOverlay.addEventListener('geometrychange', geometrychange);

    return () => {
      if (!navigator.windowControlsOverlay) {
        return;
      }
      
      navigator.windowControlsOverlay.removeEventListener('geometrychange', geometrychange);
    }
  }, []);

  const Menu = (props) => {
    return (
      <>
        <components.Menu {...props}>
          <div>
            {props.selectProps.fetchingData ? (
              <span className="fetching">Fetching data...</span>
            ) : (
              <div>{props.children}</div>
            )}
          </div>
          {text.length <= 1 && <div style={{ textAlign: 'center', padding: 5 }}>
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={ () => updateRandomHashtags(allHashtags) }
            >
              {i18n('Shuffle')}
            </button>
          </div>}
        </components.Menu>
      </>
    );
  };

  return <div className="autocomplete">
    <Select options={allOptions} placeholder={ i18n('Hashtag Search') } onInputChange={onInputChange} onChange={onChange} onFocus={onFocus} isLoading={isLoading} styles={customStyle} components={{ Menu }} />
  </div>
}
