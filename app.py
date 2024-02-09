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
import markdown2


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
    news_info = get_news_info()
    return render_template('index.html', news_info=news_info)



#####
# NANDOについて
## GET: 
@app.route('/about_nando')
def about_nando():
    return render_template('about_nando.html')

#####
# DATASETSについて
## GET: 
@app.route('/datasets')
def datasets():
    return render_template('datasets.html')

#####
# NANDOについて
## GET: 
@app.route('/epidemiology')
def epidemiology():
    return render_template('epidemiology.html')


#####
# NANDO語彙一覧
## GET: 
@app.route('/ontology/nando')
def nando(id_nando=""):
    return render_template('nando.html')


#####
# NANDO URI 転送
## GET: 
#@app.route('/ontology/NANDO_<string:id_nando>')
#def nando_uri(id_nando=""):
#    return redirect(url_for('REST_API_disease', id_nando=id_nando))


#####
# ontology files ダウンロード
## GET: 
@app.route('/ontology/<path:filename>')
def nando_file(filename):
    # https://www.kite.com/python/docs/flask.send_from_directory
    return send_from_directory('ontology',
                               filename, as_attachment=True)


#####
#  annotation files ダウンロード
## GET: 
@app.route('/annotation/<path:filename>')
def annotation_file(filename):
    # https://www.kite.com/python/docs/flask.send_from_directory
    return send_from_directory('annotation',
                               filename, as_attachment=True)


#####
# 疾患ページ
## GET:
@app.route('/disease/NANDO:<string:id_nando>', methods=['GET'])
def REST_API_disease(id_nando=""):
#    if request.method == 'GET':
#        # parse nando.ttl
#        onto = pronto.Ontology('/opt/services/case/app/nanbyodata/ontology/nando.obo')
#        breadcrumb_list_html = ""
#        sup = onto[id_nando].superclasses()
#        pre_term = next(sup)
#        subclass_list_html = make_selector_subclasses(onto, pre_term.id, "")
#        breadcrumb_list_html = ' (' + subclass_list_html + ') ' if subclass_list_html != "" else ""
#        while True:
#            try:
#                term = next(sup)
#                subclass_list_html = make_selector_subclasses(onto, term.id, pre_term.id)
#                breadcrumb_list_html = ' > ' + subclass_list_html + breadcrumb_list_html
#                pre_term = term
#            except StopIteration:
#                break
#        breadcrumb_list_html = '<font size="2">難病</font>' + breadcrumb_list_html
#        return render_template('disease.html',
#                               id_nando=id_nando,
#                               breadcrumb_list_html=breadcrumb_list_html
#        )
#    else:
#        return render_template('index.html')
#    return
    if request.method == 'GET':
        # parse nando.ttl
        onto = pronto.Ontology('/opt/services/case/app/nanbyodata/ontology/nando.obo')
        breadcrumb_list_html = ""
        sup = onto[id_nando].superclasses()
        pre_term = next(sup)
        subclass_list_html = make_selector_subclasses_new(onto, pre_term.id, "")
        breadcrumb_list_html = '<ul><li>' + subclass_list_html + '</li></ul>' if subclass_list_html != "" else ""
        while True:
            try:
                term = next(sup)
                subclass_list_html = make_selector_subclasses_new(onto, term.id, pre_term.id)
                breadcrumb_list_html = '<ul><li>' + subclass_list_html + breadcrumb_list_html + '</li></ul>'
                pre_term = term
            except StopIteration:
                break
        breadcrumb_list_html = re.sub(r'^\<ul\>', '<ul class="tree">', breadcrumb_list_html)
        breadcrumb_list_html = '<h3>難病</h3>' + breadcrumb_list_html
        return render_template('disease.html',
                               id_nando=id_nando,
                               breadcrumb_list_html=breadcrumb_list_html
        )
    else:
        return render_template('index.html')

    return


#####
# 疾患ページ new
## GET:
@app.route('/disease_old/NANDO:<string:id_nando>', methods=['GET'])
def REST_API_disease_old(id_nando=""):
    if request.method == 'GET':
        # parse nando.ttl
        onto = pronto.Ontology('/opt/services/case/app/nanbyodata/ontology/nando.obo')
        breadcrumb_list_html = ""
        sup = onto[id_nando].superclasses()
        pre_term = next(sup)
        subclass_list_html = make_selector_subclasses_new(onto, pre_term.id, "")
        breadcrumb_list_html = '<ul><li>' + subclass_list_html + '</li></ul>' if subclass_list_html != "" else ""
        while True:
            try:
                term = next(sup)
                subclass_list_html = make_selector_subclasses_new(onto, term.id, pre_term.id)
                breadcrumb_list_html = '<ul><li>' + subclass_list_html + breadcrumb_list_html + '</li></ul>'
                pre_term = term
            except StopIteration:
                break
        breadcrumb_list_html = re.sub(r'^\<ul\>', '<ul class="tree">', breadcrumb_list_html)
        breadcrumb_list_html = '<h3>難病</h3>' + breadcrumb_list_html
        return render_template('disease.html.20230823',
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
            #html_selector = html_selector + '<option value="https://nanbyodata.jp/disease/' + term.id + '"' + html_selected + '>' + term.name + '</option><br>'
            flag_subclass = 1
        except StopIteration:
            break
    html_selector = html_selector + '</select>'
    html_selector = html_selector if flag_subclass == 1 else ""

    return html_selector


def make_selector_subclasses_new(onto, id_nando, pre_id_nando):
    html_selector = ""
    flag_subclass = 0
    sub = onto[id_nando].subclasses(with_self=False, distance=1)
    html_selector = '<div class="cp_ipselect cp_sl03"><select name="' + pre_id_nando + '" style="width:150px;" onChange="location.href=value;"><br>'
    html_selector = html_selector + '<option>下位疾患</option><br>' if pre_id_nando == "" else html_selector
    while True:
        try:
            term = next(sub)
            html_selected = " selected" if term.id == pre_id_nando else ""
            html_selector = html_selector + '<option value="https://nanbyodata.jp/disease/NANDO:' + term.id + '"' + html_selected + '>' + term.name + '</option><br>'
            #html_selector = html_selector + '<option value="https://nanbyodata.jp/disease/' + term.id + '"' + html_selected + '>' + term.name + '</option><br>'
            flag_subclass = 1
        except StopIteration:
            break
    html_selector = html_selector + '</select></div>'
    html_selector = html_selector if flag_subclass == 1 else ""

    return html_selector

# Newsページ
def load_news_content(filename):
    locale = get_locale() 
    path = os.path.join("posts", locale, filename)
    with open(path, "r", encoding="utf-8") as file:
        content = file.read()
    return content

def get_news_info():
    locale = get_locale()
    path = os.path.join("posts", locale)
    md_files = [f for f in os.listdir(path) if f.endswith(".md")]

    news_data = {}

    for md_file in md_files:
        md_content = load_news_content(md_file)
        md_file_path = os.path.splitext(os.path.join("posts", md_file))[0]

        html_content = markdown2.markdown(md_content, extras=["metadata", "tables"])
        metadata = html_content.metadata
        title = metadata['title'].replace("'", "")
        date = md_file.split('-post')[0].replace('-', '.')
        news_data[md_file] = {"date": date, "title": title, "path": md_file_path}

    def sort_key(item):
        date_str, post_section = item[0].split('-post')
        post_num = post_section.split('.')[0]
        date_obj = datetime.datetime.strptime(date_str, '%Y-%m-%d')
        return (date_obj, int(post_num))


    sorted_news_data = dict(sorted(news_data.items(), key=sort_key, reverse=True))
    return sorted_news_data

@app.route('/posts/<filename>')
def page(filename):
    md_content = load_news_content(filename + '.md')
    html_content = markdown2.markdown(md_content, extras=["metadata", "tables", "task_list"])
    metadata = html_content.metadata
    title = metadata['title'].replace("'", "")
    date = filename.split('-post')[0].replace('-', '.')

    return render_template('news.html', title=title, date=date, content=html_content)