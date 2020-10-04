import React, { useState, useEffect } from "react";
import "bulma/css/bulma.css";
import "./App.css";
import "./index.css";
import ArticlesCluster from "./components/ArticlesCluster";
import LoadingAnimation from "./components/LoadingAnimation.jsx";
import useOnScreen from "./hooks/useOnScreen.jsx";

function App() {
  const VISIBLE_CLUSTERS_DESKTOP = 10;
  const VISIBLE_CLUSTERS_MOBILE = 5;
  const REQUEST_URL = "https://www.newsdata.com.ar/api/news_clusters/latest";
  const MAX_MOBILE_VIEWPORT_WIDTH = 769;

  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(
    window.innerWidth < MAX_MOBILE_VIEWPORT_WIDTH ? true : false
  );
  const [bottomIndex, setBottomIndex] = useState(0);
  const [visibleClusters, setVisibleClusters] = useState(
    isMobile ? VISIBLE_CLUSTERS_MOBILE : VISIBLE_CLUSTERS_DESKTOP
  );
  const [setRef, visible] = useOnScreen();

  //fetch json al inicio
  useEffect(() => {
    fetchData();
  }, []);

  //scroll top cuando cambia la pagina
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [bottomIndex]);

  //async function para fetchear el json
  async function fetchData() {
    const res = await fetch(REQUEST_URL);
    setLoading(true);
    res.json().then((res) => {
      setData(res);
      setLoading(false);
    });
  }

  //callback de resize: el tamaño del viewport indica: colapsar las imagenes+noticias, la cantidad de grupos a mostrar
  const handleResize = () => {
    if (window.innerWidth < MAX_MOBILE_VIEWPORT_WIDTH && !isMobile) {
      setIsMobile(true);
      setVisibleClusters(VISIBLE_CLUSTERS_MOBILE);
    } else if (window.innerWidth > MAX_MOBILE_VIEWPORT_WIDTH && isMobile) {
      setIsMobile(false);
      setVisibleClusters(VISIBLE_CLUSTERS_DESKTOP);
    }
  };
  window.addEventListener("resize", handleResize);

  //callback boton mas noticias
  const handleButton = () => {
    var newBottomIndex =
      bottomIndex + visibleClusters > data["clusters"].length - 1
        ? 0
        : bottomIndex + visibleClusters;
    setBottomIndex(newBottomIndex);
  };

  //fecha de hoy
  var date = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  date = date[0].toUpperCase() + date.substring(1);

  return (
    <div className="App">
      <section className="hero is-primary">
        <div className="hero-body">
          <div className="container has-text-left">
            <div className="columns is-mobile is-vcentered">
              <div className="logo column is-narrow">
                <img src=".\logo.png" alt="logo" />
              </div>
              <div className="column">
                <h1 className="title">news.data</h1>
                <h2 className="subtitle">Todas las noticias en un lugar</h2>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="date-header">
            <div className="level">
              <div className="level-left"> {date}</div>
            </div>
          </h2>
          {!loading ? (
            <div>
              {data["clusters"]
                .slice(
                  bottomIndex,
                  bottomIndex + visibleClusters > data["clusters"].length - 1
                    ? data["clusters"].length
                    : bottomIndex + visibleClusters
                )
                .map((articlesCluster, i) => (
                  <ArticlesCluster
                    articles={articlesCluster}
                    newsColumnFirst={i % 2 === 0}
                    isMobile={isMobile}
                    key={i + bottomIndex * visibleClusters}
                  ></ArticlesCluster>
                ))}
              {visibleClusters < data["clusters"].length && (
                <div className="container">
                  <div>
                    <div className="container">
                      <button
                        className={
                          visible ? "circleBase type2" : "circleBase type1"
                        }
                        onClick={handleButton}
                      >
                        Más noticias
                      </button>
                    </div>
                    <div ref={setRef}></div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="container">
              <LoadingAnimation></LoadingAnimation>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;
