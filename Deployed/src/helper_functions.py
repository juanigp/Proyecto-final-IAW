import bs4
from urllib.request import urlopen, Request
import nltk
import re
import string
import numpy as np
import nltkmodules


# remover puntiacion, digitos, espacios extra de un texto
def remove_punct_and_digits(input_str):
    # digitos
    out = re.sub(r'\d+', '', input_str)
    # puntuacion
    out = re.sub(r'[^\w\s]|_+', '', out)
    # espacios extra
    out = re.sub(r'\s+', ' ', out)
    # espacios al principio
    out = re.sub(r'^\s+|\s+?$', '', out)
    return out


def remove_stopwords(tokenized_str, lang):  # remover stopwords de un texto
    stopwords = nltk.corpus.stopwords.words(lang)
    return [word for word in tokenized_str if word not in stopwords]


# preprocesar texto (todo minusculas, stemmizacion, sacar stopwords)
def preprocess_str(input_str, lang):
    input_str = input_str.lower()
    input_str = remove_punct_and_digits(input_str)
    tokenized_str = remove_stopwords(nltk.word_tokenize(input_str), lang)
    stemmer = nltk.SnowballStemmer(lang)
    tokenized_str = [stemmer.stem(word) for word in tokenized_str]
    return ' '.join(tokenized_str)


# vectorizar un corpus (una lista de strings)
def vectorize_corpus(corpus, vectorizer, lang):
    preprocessed_corpus = [preprocess_str(
        entry, lang) for entry in corpus]
    vectorized_corpus = vectorizer.fit_transform(preprocessed_corpus)
    words = vectorizer.get_feature_names()
    return (vectorized_corpus, words)


# indicar que vectores son similares, a partir de una matriz de distancia y un valor de umbral
def similar_vectors_from_dist_matrix(dist, threshold):
    similar_vectors_indices_pairs = []
    # indice de la triangular superior de la matriz de distancia (la matriz de distancia es simetrica con respecto a la diagonal principal)
    iu = np.triu_indices(n=dist.shape[0])
    # enmascarar la triangular superior si la distancia es menor que el umbral y mayor que cero (la distancia de un vector con si mismo es 0)
    mask = (dist[iu] < threshold) * (dist[iu] > 0)
    indices = np.where(mask)
    # guardar los indices de las elementos que cumplieron la condicion en una lista, como pares
    for idx in range(len(indices[0])):
        similar_vectors_indices_pairs.append(
            (iu[0][indices[0][idx]], iu[1][indices[0][idx]]))
    return similar_vectors_indices_pairs


# detectar si la etiqueta <news:publication_date> de una etiqueta <url> contiene una fecha deseada
def filter_url_tag_by_date(url_tag, dates):
    flag = False
    for date in dates:
        if date in url_tag.findAll('news:publication_date')[0].get_text():
            flag = True
            break
    return flag


# detectar si la etiqueta <lastmod> de una etiqueta <url> contiene una fecha deseada (diario ambito)
def filter_url_tag_by_date_ambito(url_tag, dates):
    flag = False
    for date in dates:
        if date in url_tag.findAll('lastmod')[0].get_text():
            flag = True
            break
    return flag


# detectar si la etiqueta <url> del diario la nacion contiene una fecha deseada y la noticia es de un tema deseado
def filter_url_tag_lanacion(url_tag, dates):
    result = False
    if not url_tag.findAll('news:keywords')[0].get_text() in ['Lifestyle', 'Sociedad']:
        result = filter_url_tag_by_date(url_tag, dates)
    return result


# extraer todas las etiquetas <url> de un sitemap.xml (y filtrarlas con filter_func)
def get_urls_list_from_sitemap(url, filter_func, *args):

    news = []
    req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    successful_scrap = False
    try:
        soup = bs4.BeautifulSoup(urlopen(req).read(), "lxml")
        successful_scrap = True
    except:
        pass

    if successful_scrap:
        for url_ in soup.findAll('url'):
            if filter_func(url_, args):
                url_.findAll('loc')[0].get_text()
                title = ""
                try:
                    title = url_.findAll('news:title')[0].get_text()
                except:
                    pass
                news.append({'url': url_.findAll('loc')[
                            0].get_text(), 'title': title})

    return news


def valid_agent(request):  # verificar que un request viene de un navegador valido: adaptado de https://gist.github.com/LeZuse/2578981
    browser = request.user_agent.browser
    version = request.user_agent.version and int(
        request.user_agent.version.split('.')[0])
    platform = request.user_agent.platform
    uas = request.user_agent.string

    valid = False
    if browser and version:
        if not((browser == 'msie' and version < 9)
                or (browser == 'firefox' and version < 4)
                or (platform == 'android' and browser == 'safari' and version < 534)
                or (platform == 'iphone' and browser == 'safari' and version < 7000)
                or ((platform == 'macos' or platform == 'windows') and browser == 'safari' and not re.search('Mobile', uas) and version < 534)
                or (re.search('iPad', uas) and browser == 'safari' and version < 7000)
                or (platform == 'windows' and re.search('Windows Phone OS', uas))
                or (browser == 'opera')
                or (re.search('BlackBerry', uas))):
            valid = True
    return valid
