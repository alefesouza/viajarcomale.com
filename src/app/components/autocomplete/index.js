'use client'

import Select from 'react-select';
import useI18nClient from '@/app/hooks/use-i18n-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Autocomplete() {
  const router = useRouter()
  const i18n = useI18nClient();
  
  const featuredHashtags = [i18n('#food'), i18n('#observationdeck')];
  const featuredOptions = featuredHashtags.map((item) => ({ label: item, value: item }));
  const [allOptions, setAllOptions] = useState(featuredOptions);
  const [randomHashtags, setRandomHashtags] = useState([]);
  const [currentHashtags, setCurrentHashtags] = useState([]);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customStyle, setCustomStyles] = useState({});

  const getRandomHashtags = async () => {
    setIsLoading(true);

    const result = await fetch('/api/hashtags?random=true');
    const data = await result.json();
    const randomHashtags = data.map(h => ({ label: '#' + h, value: '#' + h }))

    setRandomHashtags(randomHashtags);
    setAllOptions([...featuredOptions, ...randomHashtags]);

    setIsLoading(false);
  }

  const getHashtags = async (text) => {
    if (text.length < 3) {
      return;
    }

    setIsLoading(true);

    const result = await fetch('/api/hashtags?s=' + text);
    const data = await result.json();
    const hashtags = data.map(h => ({ label: '#' + h, value: '#' + h }))

    setCurrentHashtags(hashtags);
    setAllOptions([...featuredOptions, ...hashtags]);

    setIsLoading(false);
  }

  const onChange = (e) => {
    document.querySelector('#loader-spinner').style.display = 'block';

    router.push('/hashtags/' + e.value.replace('#', ''));
  }

  const onInputChange = (e) => {
    if (e.length < 3) {
      setAllOptions([...featuredOptions, ...randomHashtags])
      return;
    }

    if (text.startsWith(e) || (e.startsWith(text) && currentHashtags.length > 0 && currentHashtags.length < 10)) {
      setAllOptions([...featuredOptions, ...currentHashtags])
      return;
    }
  
    setText(e);

    getHashtags(e);
  }

  const onFocus = () => {
    if (randomHashtags.length === 0) {
      getRandomHashtags();
    }
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

  return <div className="autocomplete">
    <Select options={allOptions} placeholder={ i18n('Hashtag Search') } onInputChange={onInputChange} onChange={onChange} onFocus={onFocus} isLoading={isLoading} styles={customStyle} />
  </div>
}
