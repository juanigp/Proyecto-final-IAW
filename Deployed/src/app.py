from flask import Flask, request, jsonify, abort
from flask_pymongo import PyMongo, DESCENDING
from flask_compress import Compress
import json
from bson import ObjectId
import os
from werkzeug.security import check_password_hash
from base64 import urlsafe_b64decode
from helper_functions import valid_agent

app = Flask(__name__, static_folder="./../web/", static_url_path='/')
# conexion a bd
app.config['MONGO_URI'] = os.environ['CONNECTION_STRING']
mongo = PyMongo(app)
# gzip
Compress(app)


# chequear si el post/put/delete lleva el token correcto (almacenado en documento de la bd), o si el get viene de un cliente valido
@app.before_request
def check_auth_dec():
    if request.method in ['POST', 'PUT', 'DELETE']:
        password_checked = False
        auth_header = request.headers.get('Authorization')
        try:
            sent_password = str(urlsafe_b64decode(
                auth_header.split()[1]), "utf-8")
            stored_password = mongo.db.users.find_one()['password']
            password_checked = auth_header.split()[0] == "Bearer" and check_password_hash(
                stored_password, sent_password)
        except:
            abort(400, description="Missing or wrong headers")

        if (not password_checked):
            abort(401, description="Unauthorized")
    elif request.method == 'GET':
        if (not valid_agent(request)):
            abort(401, description="Unauthorized")
    else:
        abort(400, description="Unsopported request")


# errores


@ app.errorhandler(400)
def bad_request(e):
    return jsonify(error=str(e)), 400


@ app.errorhandler(401)
def unauthroized(e):
    return jsonify(error=str(e)), 401


@ app.errorhandler(404)
def resource_not_found(e):
    return jsonify(error=str(e)), 404


@ app.errorhandler(409)
def resource_conflict(e):
    return jsonify(error=str(e)), 409


@ app.route('/')  # home
def index():
    return app.send_static_file('index.html')


# rest api del recurso news_clusters
@ app.route('/api/news_clusters', methods=['POST'])  # post
def create_news_cluster():
    new_document = request.get_json()
    if mongo.db.news_clusters.find_one({'date': new_document['date']}):
        abort(409, description="Resource already exists")
    else:
        mongo.db.news_clusters.insert(new_document)

    return jsonify({"message": "Success!"}), 200


@ app.route('/api/news_clusters', methods=['GET'])  # get (index)
def index_news_clusters():
    news_clusters_total = mongo.db.news_clusters.find().sort('date', DESCENDING)
    # los recursos tienen un campo '_id' de tipo ObjectId, que necesito castearlo a string
    news_clusters_list = list(map(
        lambda d: {key: d[key] if key != '_id' else str(d[key]) for key in d}, news_clusters_total))
    response = jsonify(news_clusters_list)

    return response


# get (por fecha)
@ app.route('/api/news_clusters/<string:date>', methods=['GET'])
def show_news_cluster(date):
    news_clusters = mongo.db.news_clusters.find_one({'date': date})
    if news_clusters == None:
        abort(404, description="Resource not found")
    news_clusters['_id'] = str(news_clusters['_id'])
    response = jsonify(news_clusters)
    return response


# endpoint para obtener el recurso de fecha mas reciente
@ app.route('/api/news_clusters/latest', methods=['GET'])
def show_latest_news_cluster():
    news_clusters_total = mongo.db.news_clusters.find().sort('date', DESCENDING)
    if news_clusters_total == None:
        abort(404, description="Resource not found")
    news_clusters = news_clusters_total[0]
    news_clusters['_id'] = str(news_clusters['_id'])
    response = jsonify(news_clusters)
    return response


@ app.route('/api/news_clusters/<string:date>', methods=['PUT'])  # put
def update_or_create_news_cluster(date):
    document = request.get_json()
    # crear si el documento no existe, si no actualizarlo
    if mongo.db.news_clusters.find_one({'date': document['date']}) == None:
        mongo.db.news_clusters.insert(document)
    else:
        mongo.db.news_clusters.replace_one(
            {'date': document['date']}, document)
    return jsonify({"message": "Success!"}), 200


@ app.route('/api/news_clusters/<string:date>', methods=['DELETE'])  # delete
def delete_news_cluster(date):

    if mongo.db.news_clusters.find_one({'date': date}) == None:
        abort(404, description="Resource not found")
    mongo.db.news_clusters.delete_one({'date': date})
    return jsonify({"message": "Success!"}), 200


if __name__ == "__main__":
    app.run(debug=False)
