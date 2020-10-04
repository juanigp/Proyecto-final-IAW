import React, { useState} from "react";

function useOnScreen(options) {
    const [ref, setRef] = useState(null);
    const [visible, setVisible] = useState(false);
  
    React.useEffect(() => {
      const observer = new IntersectionObserver(([entry]) => {
        setVisible(entry.isIntersecting);
      }, options);
  
      if (ref) {
        observer.observe(ref);
      }
      return () => {
        if (ref) {
          observer.unobserve(ref);
        }
      };
    }, [ref, options]);
    return [setRef, visible];
  }
  
  export default useOnScreen