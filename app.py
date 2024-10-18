# -*- coding: utf-8 -*-

from flask import Flask, session, render_template, request, redirect, url_for, jsonify, make_response, send_from_directory
import os
import re
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
from flask_babel import Babel
from flask_cors import CORS
import markdown2
import requests


app = Flask(__name__)
CORS(app)

app.secret_key = 'nanbyodata0824'
app.config['BASE_URI'] = os.getenv('BASE_URI', 'https://nanbyodata.jp/')

# https://github.com/shibacow/flask_babel_sample/blob/master/srv.py
def get_locale():
    if 'lang' not in session:
        session['lang'] = request.accept_languages.best_match(['ja', 'ja_JP', 'en'])
    if request.args.get('lang'):
        session['lang'] = request.args.get('lang')
    locale = session.get('lang', 'en')
    if locale not in ['ja', 'ja_JP', 'en']:
        locale = 'en'

    return locale
app.jinja_env.globals.update(get_locale=get_locale)

# flask の　@babel.localeselector
# https://stackoverflow.com/questions/75229322/flask-babel-get-locale-seems-to-be-not-working
babel = Babel(app, locale_selector=get_locale)

# debug
app.debug = True



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
# NanbyoData API page
# /api
@app.route('/api')
def api():
    return render_template('api.html')


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
# API: Feedback URL
# GET method
# /feedback?id_from=[FROM ID]&id_to=[TO ID]&type=[GOOD or BAD]
@app.route('/feedback', methods=['GET','POST'])
def api_feedback():
    r_id_from = ""
    r_id_to   = ""
    r_type    = ""
    if request.args.get('id_from') is not None:
        r_id_from = request.args.get('id_from')

    if request.args.get('id_to') is not None:
        r_id_to = request.args.get('id_to')

    if request.args.get('type') is not None:
        r_type = request.args.get('type')

    if r_id_from != "" and r_id_to != "" and r_type != "":
        app.logger.error("Feedback: The link from " + r_id_from + " to " + r_id_to + " is " + r_type)

    return ('OK'), 200


#####
# 疾患ページ
## GET:
@app.route('/disease/NANDO:<string:id_nando>', methods=['GET'])
def REST_API_disease(id_nando=""):
    if request.method == 'GET':
        breadcrumb_html = ''
        if get_locale() == "ja" or get_locale() == "ja_JP":
            onto = pronto.Ontology('./ontology/nando.obo')
            breadcrumb_html = '<section><h3 class="breadcrumb-title">難病</h3>'
        else:
            onto = pronto.Ontology('./ontology/nando.en.obo')
            breadcrumb_html = '<section><h3 class="breadcrumb-title">Intractable disease</h3>'
        sup = list(reversed(list(onto[id_nando].superclasses())))
        for index, term in enumerate(sup):
            next_term_id = sup[index + 1].id if index < len(sup) - 1 else None
            term_subclasses = (list(onto[term.id].subclasses(with_self=False, distance=1)))
            if next_term_id is None and not term_subclasses:
                continue
            subclass_html = make_selector_subclasses(onto, term.id, next_term_id, index)
            breadcrumb_html += subclass_html
        breadcrumb_html += '</section>'
        
        overview = get_overview(id_nando)
        return render_template('disease.html', id_nando=id_nando, breadcrumb_list_html=breadcrumb_html, title=overview['title'], description=overview['description'])

def make_selector_subclasses(onto, id_nando, next_term_id, index):
    if get_locale() == "ja" or get_locale() == "ja_JP":
        str_subclass = "下位疾患"
    else:
        str_subclass = "Subclass"
    selected_disease_name = onto[next_term_id].name if next_term_id in onto else str_subclass
    html_selector = f'''
    <div class="breadcrumb-tree" style="--i: {index}">
        <div class="inner-tree">
            <div class="wrapper" data-value="{next_term_id}">
                <div class="select-option">{selected_disease_name}</div>
                <div class="option-list">
                    <ul class="options">'''

    sub = onto[id_nando].subclasses(with_self=False, distance=1)
    for term in sub:
        html_selector += f'<li class="option" data-value="{term.id}">{term.name}</li>'
    html_selector += '''
                    </ul>
                </div>
            </div>
        </div>
    </div>'''

    return html_selector

def get_overview(id_nando):
    url = f"{app.config['BASE_URI']}/sparqlist/api/nanbyodata_get_overview_by_nando_id?nando_id={id_nando}"
    response = requests.get(url)
    overview = response.json()
    title = overview.get('label_ja') or overview.get('label_en', '')

    description = overview.get('description')
    if not description:
        mond_desc = overview.get('mondo_decs', [])
        if mond_desc and isinstance(mond_desc, list) and len(mond_desc) > 0:
            description = mond_desc[0].get('id')
        
        if not description:
            description = overview.get('medgen_definition', '')

    return {'title': title, 'description': description}

# Newsページ
def load_news_content(filename):
    locale = get_locale() 
    path = os.path.join("posts", locale, filename)
    with open(path, "r", encoding="utf-8") as file:
        content = file.read()
    return content

def get_news_info():
    locale = get_locale()
    if locale is None:
        locale = 'en'
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
