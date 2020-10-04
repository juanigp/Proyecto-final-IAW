import React, { useState, useEffect } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "./styles/Carousel.css";

const Carousel = (props) => {
  const [index, setIndex] = useState(0);
  const { images, period } = props;

  //incrementar indice periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((index + 1) % images.length);
    }, period);
    return () => clearInterval(interval);
  }, [index, period, images]);

  return (
    <TransitionGroup className="carousel-transition-group">
      <CSSTransition key={index} classNames="slide-carousel" timeout={1300}>
        <img
          className="carousel-image"
          src={images[index]}
          alt="Imagen de noticia"
        />
      </CSSTransition>
    </TransitionGroup>
  );
};

export default Carousel;
