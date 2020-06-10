# -*- coding: utf-8 -*-
from dao import dao_desktop as dd
from dao import dao_mobile as dm
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_from_directory
import pandas as pd
import copy
import numpy as np


# application = Flask(__name__)i



application = Flask(__name__, static_folder='static')    

@application.route('/ads.txt')
def static_from_root():
    return send_from_directory(application.static_folder, request.path[1:])



@application.route('/')
def home():
    return render_template('home.html')






@application.route('/wide')
def homewide():
    return render_template('home_wide.html')


# 화면을 요청하는 controller
@application.route('/ajax', methods = ['POST'])
def ajax_request():
    username = request.form['username']
    dao = dd.Database()
    a = dao.getClose(request.form['username'])

    return jsonify(username=a['result'][0]['CLOSE'])

# 화면을 요청하는 controller
@application.route('/ajaxTable', methods = ['POST'])
def ajax_getTable():

    st = datetime.now()

    keyA = request.form['keyA'].replace('"', '')
    keyB = request.form['keyB'].replace('"', '')
    chartid = request.form['chartId'].replace('"', '')

    interval = request.form['interval'].replace('"', '')
    orderby = request.form['orderby'].replace('"', '')

    dic = {

        '0': 'I',
        '1': 'F',
        '2': 'YG',
        '3': 'S',
        '4': 'T',
        '5': 'FN',
        '6': 'OC',
        '7': 'PS',
        '8': 'IS',
        '9': 'BK',


    }
    dao = dm.Database()
    htmltable = dao.sndRank([dic[keyA],dic[keyB]],interval.split(','),dic[keyA]+orderby,'DESC',chartid)

    return htmltable


@application.route('/ajaxChart', methods=['POST'])
def ajax_getSndChart():


    stockcode = request.form['stockcode'].replace('"', '')


    dao = dm.Database()
    chartData, infotable = dao.sndChart(stockcode)
    finantable = dao.finanTable(stockcode)

    return jsonify(sampledata=chartData, infotable=infotable, finantable=finantable)





@application.route('/ajaxRelated', methods=['POST'])
def ajax_getSndRelated():

    chartid = request.form['chartId'].replace('"', '')
    stockcode = request.form['stockcode'].replace('"', '')

    dao = dm.Database()
    htmltable = dao.sndRelated(stockcode, chartid)

    return htmltable


@application.route('/info')
def info():
    return render_template('info.html')

@application.route('/sndChart', methods=['GET'])
def sndChart():

    requestedCode = request.args.get('stockcode')

    dao = dd.Database()
    rs = dao.nameCodeValidation(requestedCode)

    chartData = None

    # rs[0] => 종목명이 존재하면
    if (rs[0]):
        chartData = dao.sndChart(requestedCode)
        sndData = dao.sndInfo(requestedCode)


    return render_template('sndChart.html', sampledata=chartData, stockname=rs[1], column=sndData[1], sndInfo=sndData[0])


@application.route('/sndRankRelative', methods=['GET','POST'])
def sndRankRelative():

    if request.method == 'POST':

        print("[DEBUG] FORM VALUE IN DICTIONARY :" , dict(request.form))

        if('window' in dict(request.form)):
            request_window = dict(request.form)['window']
        else:
            request_window = ['YG','S']


        if('interval' in dict(request.form)):
            request_interval = dict(request.form)['interval']
        else:
            request_interval = ['1','5','20']

        if ('order' in dict(request.form)):
            request_order = dict(request.form)['order']
        else:
            request_order = ['I']

        if ('by' in dict(request.form)):
            request_by = dict(request.form)['by']
        else:
            request_by = ['DESC']

        if ('market' in dict(request.form)):
            request_market = dict(request.form)['market']
        else:
            request_market = ['0','1']


        if ('range' in dict(request.form)):
            request_range = dict(request.form)['range']
        else:
            request_range = ['0:0.8','0.8:2','2:4','4:8','8:10','10:500']

    # select option == None, default option
    else:
        request_window = ['YG', 'S']
        request_by = ['DESC']
        request_order = ['I']
        request_interval = ['1', '5', '20']
        request_market = ['0', '1']
        request_range = ['0:0.8', '0.8:2', '2:4', '4:8', '8:10', '10:500']

    dao = dd.Database()
    column, table, dt = dao.sndRank(request_window,request_interval,request_order,request_by,request_market,request_range)


    #print(table)
    #print(column)
    return render_template('sndRankRelative.html', sampledata=table, column=column, date = dt)



@application.route('/sndRankMine', methods=['GET','POST'])
def sndRankMine():

    # if request.method == 'POST':

    codelist = dict(request.form)['codeList']

    print("HERE, ",codelist)

    if ('window' in dict(request.form)):
        request_window = dict(request.form)['window']
    else:
        request_window = ['YG', 'S']

    if ('interval' in dict(request.form)):
        request_interval = dict(request.form)['interval']
    else:
        request_interval = ['1', '5', '20']

    if ('order' in dict(request.form)):
        request_order = dict(request.form)['order']
    else:
        request_order = ['I']



    dao = dd.Database()
    column, table, dt = dao.sndRankMine(request_window,request_interval,codelist)
    return render_template('sndRankMine.html', sampledata=table, column=column, date = dt)

@application.route('/sndRankIndependence', methods=['GET','POST'])
def sndRankIndependence():
    if request.method == 'POST':
        if ('order' in dict(request.form)):
            request_order = dict(request.form)['order']
        else:
            request_order = ['I']
        request_by = ['ASC']
    else:
        request_by = ['ASC']
        request_order = ['I']

    dao = dd.Database()
    column, table, dt = dao.sndIndependent(request_order, request_by)
    return render_template('sndRankIndependence.html', sampledata=table, column=column, date = dt)


@application.route('/recommSummary', methods=['GET','POST'])
def recommSummary():


    dao = dd.Database()
    column, table = dao.recommSummary()


    return render_template('recommSummary.html', sampledata=table, column=column)



@application.route('/recommList', methods=['GET'])
def recommList():

    requestedCode = request.args.get('mid')
    dao = dd.Database()
    column, table = dao.recommList(requestedCode)
    return render_template('recommList.html', sampledata=table, column=column)





@application.route('/recommSummaryTest', methods=['GET','POST'])
def recommSummaryTest():


    dao = dd.Database()
    column, table = dao.recommSummaryTest()


    return render_template('recommSummary.html', sampledata=table, column=column)



@application.route('/recommListTest', methods=['GET'])
def recommListTest():

    requestedCode = request.args.get('mid')
    dao = dd.Database()
    column, table = dao.recommListTest(requestedCode)
    return render_template('recommList.html', sampledata=table, column=column)



if __name__ == '__main__':
    application.run(debug=True, host='0.0.0.0')
