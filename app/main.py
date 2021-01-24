# -*- coding: utf-8 -*-
from jazzstock_net.app.dao.dao_stock import DataAccessObjectStock
from jazzstock_net.app.dao.dao_user import DataAccessObjectUser
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_from_directory, session

application = Flask(__name__, static_folder='static', )
application.config['SECRET_KEY'] = 'the random string'



@application.route('/login', methods=['POST'])
def login():
    msg = ''
    if request.method == 'POST' and 'id' in request.form and 'pw' in request.form:

        id = request.form['id']
        pw = request.form['pw']

        dao_user = DataAccessObjectUser()

        response = dao_user.login(id, pw)
        if response['result']:
            session['loggedin'] = True
            session['id'] = id
            session['username'] = id
            msg = 'Logged in successfully !'
        else:
            msg = 'Incorrect username / password !'
    print(msg)
    return render_template('home.html', login_status=session_parser())

@application.route('/logout', methods=['POST'])
def logout():
    '''
    TODO : HTML페이지상에 LOGIN_STATUS 기준으로 로그인/로그아웃 BAR 구현하기
    '''

    session.destroy()
    return render_template('home.html', login_status=session_parser())

def register():
    pass



def session_parser(init=False):
    '''
    TODO :
        즐찾종목또는 USER에 귀속된 모든 정보는 SESSION에 그대로 반환하도록
        init True인경우만


    '''
    id = session.get('id')
    name = session.get('name')
    loggedin = session.get('loggedin')



    return {'id':id, 'name':name, 'loggedin':loggedin}


@application.route('/ads.txt')
def static_from_root():
    return send_from_directory(application.static_folder, request.path[1:])


@application.route('/')
def home():
    return render_template('home.html', login_status=session_parser())



# 화면을 요청하는 controller
@application.route('/ajaxTable', methods = ['POST'])
def ajax_getTable():
    '''
    TODO
        1. HTML을 SERVER SIDE 에서 RENDERING 하지 않고, CLIENT SIDE에서 RENDERING 하도록 본 함수에서는 JSON을 그대로 RETURN 하도록 수정
        2. SESSION정보에 따라서 불러오는 ROW수 또는 컬럼수를 조정해줘야한다.

    '''
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

    st = datetime.now()

    # if not os.path.isfile('test.pkl'):
    #     dao = DataAccessObject()
    #     htmltable = dao.sndRank([dic[keyA],dic[keyB]],interval.split(','),dic[keyA]+orderby,'DESC',chartid)
    #     save_object(htmltable, 'test.pkl')
    #     print('@@@', datetime.now()- st)
    # else:
    #     htmltable = read_object('test.pkl')
    #     print('###', datetime.now()- st)

    dao = DataAccessObjectStock()
    print(session_parser()['id'])
    if session_parser()['id'] != None:
        limit=100
    else:
        limit=5
    htmltable = dao.sndRank([dic[keyA], dic[keyB]], interval.split(','), dic[keyA] + orderby, 'DESC', chartid, limit=limit)
    print('###', datetime.now() - st)
    return htmltable

# def check_object(filename):
#
#     if os.path.isfile(filename):
#         return True
#     else:
#         return False
#
# def save_object(obj, filename):
#     with open(filename, 'wb') as output:
#         pickle.dump(obj, output, pickle.HIGHEST_PROTOCOL)
#
# def read_object(filename):
#     with open(filename, 'rb') as input:
#         obj = pickle.load(input)
#         return obj



@application.route('/ajaxChart', methods=['POST'])
def ajax_getSndChart():
    '''
    CHART데이터는 Javascript단에서 최대한 빠르게 RENDERING 할 수 있는 자료구조로 처리해서 반환한다
    빠른반복과 적은 트래픽이 오가는게 관건
    '''

    stockcode = request.form['stockcode'].replace('"', '')

    start = datetime.now()

    dao = DataAccessObjectStock()
    chartData = dao.sndChart(stockcode)
    finantable = dao.finanTable(stockcode)

    print(datetime.now()-start)
    return jsonify(sampledata=chartData, finantable=finantable)




@application.route('/ajaxRelated', methods=['POST'])
def ajax_getSndRelated():

    chartid = request.form['chartId'].replace('"', '')
    stockcode = request.form['stockcode'].replace('"', '')

    dao = DataAccessObject()
    htmltable = dao.sndRelated(stockcode, chartid)

    return htmltable


@application.route('/info')
def info():
    return render_template('info.html')


if __name__ == '__main__':
    application.run(debug=True, host='0.0.0.0', port=9001)
