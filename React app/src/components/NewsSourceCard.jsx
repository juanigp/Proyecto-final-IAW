import React, { useState } from "react";
import "./styles/NewsSourceCard.css";
import { CSSTransition, TransitionGroup } from "react-transition-group";

const NewsSourceCard = (props) => {
  const [index, setIndex] = useState(0);

  //calcular el valor del indice de un arreglo circular
  const calculateCircularIndex = (i, n) => {
    return (i + n) % n;
  };

  //generar los puntitos que indican que noticia esta activa
  const makeDots = (activeDot, numDots, maxDotsToShow) => {
    var dots = [];
    for (let i = 0; i < Math.min(numDots, maxDotsToShow); i++) {
      var dotClass =
        i === activeDot ||
        (i === maxDotsToShow - 1 && activeDot > maxDotsToShow - 1)
          ? "dot dot-inactive"
          : "dot dot-active";
      dots.push(<span className={dotClass} key={i}></span>);
    }
    return dots;
  };

  //avanzar, retroceder noticias
  const handleNextButton = () => {
    setIndex(calculateCircularIndex(index + 1, props.articles.length));
  };
  const handlePrevButton = () => {
    setIndex(calculateCircularIndex(index - 1, props.articles.length));
  };

  //arreglo con los largos de los titulos
  const articlesLength = props.articles.map((article) => article.title.length);
  //indice del titulo mas largo
  const longestArticleIndex = articlesLength.indexOf(
    Math.max(...articlesLength)
  );

  return (
    <TransitionGroup>
      <CSSTransition key={index} classNames="slide" timeout={300} exit={false}>
        <article className="box news-source-card">
          {/*header*/}
          <header className="has-text-left">
            <img
              className="news-source-logo"
              src={
                process.env.PUBLIC_URL +
                "/static/media/news_sources_logos/" +
                props.source +
                ".jpg"
              }
              alt={props.source + " logo"}
            />
          </header>

          {/*contenido de la tarjeta*/}
          <div className="card-content-title has-text-left">
            {/*titulo más largo de la fuente, invisible, para setear el tamaño de la tarjeta*/}
            <div className="title invisible-card-title is-6">
              {props.articles[longestArticleIndex].title}
            </div>
            {/*titulo a mostrar*/}
            <div className="title visible-card-title is-6">
              <a href={props.articles[index].url}>
                {props.articles[index].title}
              </a>
            </div>
          </div>
          {/*mostrar footer si la fuente tiene mas de una noticia */}
          {props.articles.length > 1 && (
            <footer className="columns is-mobile">
              {/*boton izquierda */}
              <div className="column is-one-quarter">
                <div className="button is-text" onClick={handlePrevButton}>
                  <span className="icon is-small">
                    <img
                      src={
                        process.env.PUBLIC_URL +
                        "/static/media/icons/arrow-left.svg"
                      }
                      alt="Anterior"
                    />
                  </span>
                </div>
              </div>
              {/*puntitos */}
              <div className="dots column is-half">
                {makeDots(index, props.articles.length, 7)}
              </div>
              {/*boton derecha */}
              <div className="column is-one-quarter">
                <div className="button is-text" onClick={handleNextButton}>
                  <span className="icon is-small">
                    <img
                      src={
                        process.env.PUBLIC_URL +
                        "/static/media/icons/arrow-right.svg"
                      }
                      alt="Siguiente"
                    />
                  </span>
                </div>
              </div>
            </footer>
          )}
        </article>
      </CSSTransition>
    </TransitionGroup>
  );
};

export default NewsSourceCard;
