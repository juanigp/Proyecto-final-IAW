from helper_functions import filter_url_tag_by_date, filter_url_tag_by_date_ambito, filter_url_tag_lanacion
from datetime import date

# lista de sitios a scrapear (sitemaps xml sacados de sus correspondientes robots.txt). Se puede expandir.
# de cada sitemap se extraen todas las etiquetas <url> y se descartan las que no poseen info relevante.
# como cada sitemap puede utilizar etiquetas distintas para organizar la informacion dentro del <url>,
# el campo filter_func indica una funcion a aplicar a las <url> del sitemap para filtrar las que no son deseadas
sitemaps_list = [
    {'url': 'https://www.lanacion.com.ar/ln-news.xml', 'source': 'la_nacion',
        'filter_func': filter_url_tag_lanacion},
    {'url': 'https://www.clarin.com/sitemap_google_news.xml', 'source': 'clarin',
     'filter_func': filter_url_tag_by_date},
    {'url': 'https://www.infobae.com/news_sitemap.xml', 'source': 'infobae',
     'filter_func': filter_url_tag_by_date},
    {'url': 'https://www.perfil.com/sitemap/' + str(date.today()).replace('-', '/'), 'source': 'perfil',
        'filter_func': filter_url_tag_by_date},
    {'url': 'https://www.pagina12.com.ar/breakingnews.xml', 'source': 'pagina_12',
        'filter_func': filter_url_tag_by_date},
    {'url': 'https://tn.com.ar/arcio/news-sitemap/', 'source': 'tn',
        'filter_func': filter_url_tag_by_date},
    {'url': 'https://www.ambito.com/sitemap.xml', 'source': 'ambito',
        'filter_func': filter_url_tag_by_date_ambito},
    {'url': 'https://www.filo.news/sitemap/sitemap-googlenews.xml', 'source': 'filo_news',
        'filter_func': filter_url_tag_by_date},
    {'url': 'https://radiomitre.cienradios.com/news-sitemap.xml', 'source': 'radio_mitre',
        'filter_func': filter_url_tag_by_date}, ]
