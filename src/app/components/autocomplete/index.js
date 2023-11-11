'use client'

import Select from 'react-select';
import useI18nClient from '@/app/hooks/use-i18n-client';
import { useRouter } from 'next/navigation';
import { getFirestore, getDocs, collection, query, where, limit } from 'firebase/firestore';
import { app } from '@/firebase-client';
import { useState } from 'react';
import { ITEMS_PER_PAGE } from '@/app/utils/constants';
import arrayShuffle from '@/app/utils/array-shuffle';

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

  const db = getFirestore(app);

  const getRandomHashtags = async () => {
    setIsLoading(true);

    const totalHashtags = 521;

    const array = Array.from(Array(totalHashtags).keys());
    const randomArray = arrayShuffle(array, Math.random()).slice(0, ITEMS_PER_PAGE);

    const snapshot = await getDocs(query(collection(db, 'hashtags'), where('index', 'in', randomArray)));
    const randomHashtags = [];
    
    snapshot.forEach((item) => {
      const data = item.data();
      randomHashtags.push({ label: '#' + data.name, value: '#' + data.name });
    });

    randomHashtags.sort((a, b) => randomArray.indexOf(a.index) - randomArray.indexOf(b.index));

    setRandomHashtags(randomHashtags);
    setAllOptions([...featuredOptions, ...randomHashtags]);

    setIsLoading(false);
  }

  const getHashtags = async (text) => {
    if (text.length < 3) {
      return;
    }

    setIsLoading(true);

    const end = text.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));

    const snapshot = await getDocs(query(collection(db, 'hashtags'), where('name', '>=', text), where('name', '<', end), limit(10)));
    const hashtags = [];
    
    snapshot.forEach((item) => {
      const data = item.data();
      hashtags.push({ label: '#' + data.name, value: '#' + data.name });
    });
    console.log(hashtags)

    setCurrentHashtags(hashtags);
    setAllOptions([...featuredOptions, ...hashtags]);

    setIsLoading(false);
  }

  const onChange = (e) => {
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

  return <div className="autocomplete">
    <Select options={allOptions} placeholder={ i18n('Hashtag Search') } onInputChange={onInputChange} onChange={onChange} onFocus={onFocus} isLoading={isLoading} />
  </div>
}
