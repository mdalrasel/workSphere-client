import { useMatches, useLocation } from 'react-router';
import { useEffect, useState } from 'react';

const usePageTitle = () => {
  const matches = useMatches();
  const location = useLocation();
  const [title, setTitle] = useState("WorkSphere");

  useEffect(() => {
    // reverse kore first je match e title ache seta nibo
    const matchWithTitle = [...matches].reverse().find(match => match.handle?.title);
    setTitle(matchWithTitle?.handle?.title || "WorkSphere");
  }, [location, matches]);

  return title;
};

export default usePageTitle;
