import React, { useState, useEffect } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "./styles/ArticlesCluster.css";
import NewsSourceCard from "./NewsSourceCard";
import Carousel from "./Carousel";

const ArticlesCluster = (props) => {
  const MAX_DISPLAY_ARTICLES_MOBILE = 3;
  const MAX_DISPLAY_ARTICLES_DESKTOP = 4;
  const [page, setPage] = useState(0);
  const [maxDisplayArticles, setMaxDisplayArticles] = useState(
    MAX_DISPLAY_ARTICLES_DESKTOP
  ); //cuantas fuentes mostrar en pantalla, dependiendo la resolucion del dispositivo
  const sources = Object.keys(props.articles);

  //Calcular el valor de la pagina, teniendo en cuenta la cantidad de noticias a mostrar simultaneamente
  const calculatePage = (page, numArticles, maxDisplayArticles) => {
    return page % (Math.floor((numArticles - 1) / maxDisplayArticles) + 1);
  };

  //Actualizar cuantos articulos se muestran por pagina cuando cambia el viewport
  useEffect(() => {
    setMaxDisplayArticles(
      props.isMobile
        ? MAX_DISPLAY_ARTICLES_MOBILE
        : MAX_DISPLAY_ARTICLES_DESKTOP
    );
    setPage(calculatePage(page, sources.length, maxDisplayArticles));
  }, [props, page, sources, maxDisplayArticles]);

  //Boton pagina siguiente
  const handleNextPage = () => {
    setPage(calculatePage(page + 1, sources.length, maxDisplayArticles));
  };

  //Imagenes a filtrar del Carousel
  const undesirableImages = [
    "https://www.infobae.com/pf/resources/images/fallback-promo-image.png",
    "https://www.pagina12.com.ar/assets/media/FallBack-Logo.jpg",
  ];

  //Arreglo para guardar las distintas paginas de clusters
  var articlesClusterPages = []; //cada pagina de clusters es un arreglo con 3 o 4 noticias (dependiendo de si es mobil o no)
  //Arreglo con las urls de las imagenes de cada noticia
  var images = [];
  /*Para cada fuente: colocar una NewsSourceCard en la pagina que corresponde, con el className que corresponde
  y guardar la url de su top image en el arreglo images*/
  sources.forEach((source, i) => {
    if (i % maxDisplayArticles === 0) {
      articlesClusterPages.push([]);
    }
    var column_class =
      sources.length < 3 || props.isMobile
        ? "column is-full"
        : "column is-half";
    articlesClusterPages[Math.floor(i / maxDisplayArticles)].push(
      <div className={column_class} key={i}>
        <NewsSourceCard source={source} articles={props.articles[source]} />
      </div>
    );
    props.articles[source].forEach((article) => {
      images.push(article.top_image);
    });
  });

  //wrapear cada pagina en un contenedor
  articlesClusterPages = articlesClusterPages.map((articlesGroup) => (
    <div className="columns is-multiline is-vcentered is-centered">
      {articlesGroup}
    </div>
  ));

  //sacar imagenes indeseadas
  undesirableImages.forEach(
    (url) => (images = images.filter((image) => !image.includes(url)))
  );

  //Columna del Carousel
  const imageColumn = (
    <div className="column is-one-third images-column" key={0}>
      <Carousel images={images} period={Math.random() * 1000 + 2000} />
    </div>
  );

  //Columna con las noticias
  var articlesColumn = (
    <div className="column is-two-thirds articles-column" key={{ page }}>
      <TransitionGroup>
        <CSSTransition key={page} classNames="slide-articles" timeout={300}>
          {/*div visible con la pagina de noticias que se ven en pantalla*/}
          <div className={"articles-cluster-visible-content"}>
            {articlesClusterPages[page]}{" "}
          </div>
        </CSSTransition>
      </TransitionGroup>
      {/*div invisible con la primer pagina de noticias, para fijar el tamaño  */}
      <div className={"articles-cluster-invisible-content"}>
        {articlesClusterPages[0]}{" "}
      </div>
      <div>
        {Math.floor(sources.length / (maxDisplayArticles + 1)) > 0 && (
          <div className="column">
            <div className="button is-text" onClick={handleNextPage}>
              <span className="icon is-medium">
                <img
                  src={
                    process.env.PUBLIC_URL +
                    "/static/media/icons/sort-down-solid.svg"
                  }
                  alt="Más noticias similares"
                />
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  //la disposicion de las columnas, dependiendo si las imagenes van a la izquierda o derecha
  const columns =
    !props.newsColumnFirst || props.isMobile
      ? [imageColumn, articlesColumn]
      : [articlesColumn, imageColumn];

  return (
    <div className={"box articles-cluster-container"}>
      <div className="columns is-gapless">{columns}</div>
    </div>
  );
};

export default ArticlesCluster;
