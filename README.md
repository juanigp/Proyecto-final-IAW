# Proyecto-final-IAW: news.data

### Noticias del día de distintos medios, agrupadas por el evento que cubren  
### disponible en www.newsdata.com.ar  
### presentación: https://youtu.be/3hITON74GvY

### Funcionamiento básico

- Backend y API REST en **Flask**. La API permite consumir grupos de noticias de un mismo tópico en base a la fecha de publicación. Los documentos de los recursos están almacenados en **MongoDB**.  
- El servidor periódicamente ejecuta un script .py para scrapear y agrupar nuevas noticias, e insertarlas en la BD.  
- Una SPA en **React** consume la API y muestra la información.


### Organización del repo:

- **React app** : Código fuente de la SPA.

- **Deployed** : Directorio hosteado en heroku.  
    **Deployed/web** : Build de la SPA  
    **Deployed/src** : Código Python del backend  
    **Deployed/src/app.py** : Aplicación de Flask  
    **Deployed/src/scrap_and_cluster_script.py** : Script ejecutado periódicamente para scrapear nuevas noticias  
    **Deployed/src/news_sources.py** : Lista de sitios a scrapear
    
