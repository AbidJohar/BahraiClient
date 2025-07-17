import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom';

const ScrollToTop = ({scrollRef}) => {
    const {pathname} = useLocation();

  useEffect(()=>{

      if (scrollRef?.current) {
      scrollRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

  },[pathname])

  return  null
}

export default ScrollToTop
