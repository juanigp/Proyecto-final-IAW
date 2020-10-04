from news_sources import sitemaps_list
from helper_functions import get_urls_list_from_sitemap, vectorize_corpus,  similar_vectors_from_dist_matrix
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_distances
from newspaper import Article
from datetime import date
import networkx as nx
import numpy as np
import os
from urllib.request import Request, urlopen
import json
from collections import defaultdict
from credential import admin_password
from base64 import urlsafe_b64encode


today = str(date.today())
news_list = []  # lista de noticias
news_amounts_list = []  # lista de cantidad de noticias de cada fuente
put_url = "https://www.newsdata.com.ar/api/news_clusters/" + today

# scraping
# para cada fuente de sitemaps_list
for source_dict in sitemaps_list:
    # obtener todos los articulos del dia
    sitemap_url = source_dict['url']
    source_name = source_dict['source']
    filter_func = source_dict['filter_func']
    news = get_urls_list_from_sitemap(sitemap_url, filter_func, today)
    # contar la cantidad de noticias de la fuente
    news_amount = 0
    # para cada articulo
    for article in news:
        article_url = article['url']
        downloaded_article = Article(article_url)
        # descargarlo con newspaper3k
        try:
            downloaded_article.download()
            downloaded_article.parse()
        except:
            continue
        # usar el titulo extraido con newspaper3k, si el que se habia scrapeado era ''
        article_title = article['title'] if article['title'] != '' else downloaded_article.title
        article_text = downloaded_article.text
        article_top_image = downloaded_article.top_image
        # diccionario con toda la info del articulo
        article_document = {
            'url': article_url,
            'title': article_title,
            'text': article_text,
            'top_image': article_top_image,
            'source': source_name
        }
        # incrementar la cantidad de noticias de la fuente
        news_amount += 1
        news_list.append(article_document)
    news_amounts_list.append(news_amount)


# clustering
# formar el corpus (lista de strings)
corpus = [article['text'] for article in news_list]
# numero total de noticias
total_news_amount = len(corpus)
# inicializar una matriz de 1s para almacenar las distancias entre todas las noticias
complete_dist_matrix = np.ones([total_news_amount, total_news_amount])
# vectorizar corpus
vectorized_corpus, words = vectorize_corpus(
    corpus, TfidfVectorizer(), 'spanish')

# contador cuantas noticias fueron analizadas hasta ahora
acu = 0
# para la cantidad de noticias de cada fuente (a excepcion de la ultima fuente)
for news_amount in news_amounts_list[0:-1]:
    # continuar, si una fuente no tiene noticias
    if news_amount == 0:
        continue
    # calcular la matriz de distancia entre las noticias de la fuente actual y las noticias de las fuentes que siguen
    # (las distancias de las noticas de la fuente actual y las fuentes anteriores quedan en la triangular inferior por lo que no se calculan)
    dist_matrix = cosine_distances(
        vectorized_corpus[acu:acu+news_amount], vectorized_corpus[acu+news_amount::])
    # insertar la matriz de distancias calculada en el lugar correspondiente de la matriz de distancias entre todas las noticias
    complete_dist_matrix[acu:acu+news_amount, acu+news_amount::] = dist_matrix
    acu += news_amount

# de la matriz de distancia, encontrar los pares de (los indices de las) noticias similares
similar_texts_indices_pairs = similar_vectors_from_dist_matrix(
    complete_dist_matrix, 0.7)
# con los pares, armar un grafo
G = nx.Graph()
G.add_edges_from(similar_texts_indices_pairs)
news_clusters = []  # lista de clusters
# con el grafo, calcular los componentes conectados. para cada componente:
for connected_component in nx.connected_components(G):
    # solo analizar los clusters con mas de 3 noticias
    if len(connected_component) < 3:
        continue
    else:
        news_cluster = defaultdict(list)
        # para cada noticia del cluster, insertarla en news_cluster
        for component in connected_component:
            article_len = len(news_list[component]['text'])
            news_list[component]['article_length'] = article_len
            news_list[component].pop('text')
            news_cluster[news_list[component]['source']].append(
                news_list[component])
        for source in news_cluster:
            # ordenar las noticias de una fuente del cluster segun su largo
            news_cluster[source] = sorted(
                news_cluster[source], key=lambda article: article['article_length'], reverse=True)

    # insertar el cluster en la lista de clusters
    news_clusters.append(news_cluster)

# insertar la lista de clusters en la bd
if news_clusters != []:
    news_clusters = sorted(
        news_clusters, key=lambda news_cluster: len(news_cluster), reverse=True)
    document = {'date': today, 'clusters': news_clusters}
    auth_string = 'Bearer ' + \
        str(urlsafe_b64encode(admin_password.encode("utf-8")), "utf-8")
    req = Request(put_url, data=bytes(json.dumps(document), encoding="utf-8"), headers={
        'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': auth_string, 'User-Agent': 'Mozilla/5.0'},  method='PUT')
    resp = urlopen(req)
