import React, { useState, useEffect } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "./App.css";
import "./../index.css";
import newsSourcesImages from "./newsSourcesImages.js";

const SourceCard = (props) => {
  var style1 = {
    transform: "translateX(0)",
  };

  var style2 = {
    transform: "translateX(10px)",
    transition: "position 10s",
  };

  useEffect(() => {
    //setOpened(!opened);
  });
  //indice del arreglo de noticias
  const [index, setIndex] = useState(0);
  const [opened, setOpened] = useState(false);
  //incrementar, decrementar el indice, de manera circular

  const incrementIndex = () => setIndex((index + 1) % props.articles.length);
  const handleButton = () => {
    setOpened(true);
    incrementIndex();
  };

  const decrementIndex = () =>
    setIndex(
      (((index - 1) % props.articles.length) + props.articles.length) %
        props.articles.length
    );
  //arreglo con los largos de los titulos
  const articlesLength = props.articles.map((article) => article.title.length);
  //indice del titulo mas largo
  const longestArticleIndex = articlesLength.indexOf(
    Math.max(...articlesLength)
  );

  //generar los puntitos que indican que noticia esta activa
  const makeDots = (numDots, activeDot) => {
    var dots = [];
    props.articles.forEach((article, index) => {
      var dotClass = index == activeDot ? "dot dot-inactive" : "dot dot-active";
      dots.push(<span className={dotClass}></span>);
    });
    return dots;
  };

  return (
    /*
    <TransitionGroup>
      <CSSTransition key={index} classNames="slide" timeout={3000}>*/
    <article className="box news-source-card">
      {/*header*/}
      <header className="has-text-left">
        <img
          className="news-source-logo"
          src={newsSourcesImages[props.articles[index].source].url}
          alt={newsSourcesImages[props.articles[index].source].text}
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
          <a href={props.articles[index].url}>{props.articles[index].title}</a>
        </div>
      </div>
      {/*mostrar footer si la fuente tiene mas de una noticia */}
      {props.articles.length > 1 && (
        <footer className="columns is-mobile">
          {/*boton izquierda */}
          <div className="column is-one-quarter">
            <button class="button is-text" onClick={decrementIndex}>
              <span class="icon is-medium">
                <i class="fas fa-angle-left"></i>
              </span>
            </button>
          </div>
          {/*puntitos */}
          <div className="dots column is-half">
            {makeDots(props.articles.length, index)}
          </div>
          {/*boton derecha */}
          <div className="column is-one-quarter">
            <button class="button is-text" onClick={incrementIndex}>
              <span class="icon is-medium">
                <i class="fas fa-angle-right"></i>
              </span>
            </button>
          </div>
        </footer>
      )}
    </article>
    /*
      </CSSTransition>
    </TransitionGroup>*/
  );
};

export default SourceCard;
