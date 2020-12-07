# -*- coding: utf-8 -*-

from flask import Flask, session, render_template, request, redirect, url_for, jsonify, make_response, send_from_directory
import os
import re
import MySQLdb
import json
import sys
import datetime
import copy
import pronto
#import mojimoji
#from werkzeug import secure_filename
from io import StringIO, BytesIO
import csv
# https://blog.capilano-fw.com/?p=398
from flask_babel import gettext,Babel
from flask_cors import CORS



app = Flask(__name__)
CORS(app)

app.secret_key = 'nanbyodata0824'

# https://github.com/shibacow/flask_babel_sample/blob/master/srv.py
babel = Babel(app)
@babel.localeselector
def get_locale():
    if 'lang' not in session:
        session['lang'] = request.accept_languages.best_match(['ja', 'ja_JP', 'en'])
    if request.args.get('lang'):
        session['lang'] = request.args.get('lang')
    return session.get('lang', 'en')
app.jinja_env.globals.update(get_locale=get_locale)

# debug
app.debug = True

#####
# DB設定
app.config.from_pyfile('config.cfg')
db_sock = app.config['DBSOCK']
db_name = app.config['DBNAME']
db_user = app.config['DBUSER']
db_pw   = app.config['DBPW']


#####
# Routing
# http://qiita.com/Morinikki/items/c2af4ffa180856d1bf30
# http://flask.pocoo.org/docs/0.12/quickstart/
#####

#####
# index page
## GET: display top page
@app.route('/')
def index():
    return render_template('index.html')


#####
# NANDOについて
## GET: 
@app.route('/about_nando')
def about_nando():
    return render_template('about_nando.html')


#####
# NANDO語彙一覧
## GET: 
@app.route('/ontology/nando')
def nando():
    return render_template('nando.html')


#####
# nando.ttl, nando.rdf ダウンロード
## GET: 
@app.route('/ontology/<path:filename>')
def nando_file(filename):
    # https://www.kite.com/python/docs/flask.send_from_directory
    return send_from_directory('ontology',
                               filename, as_attachment=True)


#####
# 疾患ページ
## GET:
@app.route('/disease/NANDO:<string:id_nando>', methods=['GET'])
def REST_API_disease(id_nando=""):
    if request.method == 'GET':

        # parse nando.ttl
        onto = pronto.Ontology('/opt/services/case/app/nanbyodata/ontology/nando.obo')
        breadcrumb_list_html = ""
        sup = onto[id_nando].superclasses()
        pre_term = next(sup)
        subclass_list_html = make_selector_subclasses(onto, pre_term.id, "")
        breadcrumb_list_html = ' (' + subclass_list_html + ') ' if subclass_list_html != "" else ""
        while True:
            try:
                term = next(sup)
                subclass_list_html = make_selector_subclasses(onto, term.id, pre_term.id)
                breadcrumb_list_html = ' > ' + subclass_list_html + breadcrumb_list_html
                pre_term = term
            except StopIteration:
                break
        breadcrumb_list_html = '<font size="2">難病</font>' + breadcrumb_list_html

        return render_template('disease.html',
                               id_nando=id_nando,
                               breadcrumb_list_html=breadcrumb_list_html
        )
    else:
        return render_template('index.html')

    return


def make_selector_subclasses(onto, id_nando, pre_id_nando):
    html_selector = ""
    flag_subclass = 0
    sub = onto[id_nando].subclasses(with_self=False, distance=1)
    html_selector = '<select name="' + pre_id_nando + '" style="width:150px;" onChange="location.href=value;"><br>'
    html_selector = html_selector + '<option>下位疾患</option><br>' if pre_id_nando == "" else html_selector
    while True:
        try:
            term = next(sub)
            html_selected = " selected" if term.id == pre_id_nando else ""
            html_selector = html_selector + '<option value="https://nanbyodata.jp/disease/NANDO:' + term.id + '"' + html_selected + '>' + term.name + '</option><br>'
            flag_subclass = 1
        except StopIteration:
            break
    html_selector = html_selector + '</select>'
    html_selector = html_selector if flag_subclass == 1 else ""

    return html_selector

