from jazzstock_net.app.dao.dao_stock import DataAccessObjectStock
from jazzstock_net.app.dao.dao_user import DataAccessObjectUser
from jazzstock_net.app.common.mail import send_mail
import jazzstock_net.app.config.config as cf
from datetime import datetime
from io import StringIO
from flask import Flask, render_template, request, jsonify, send_from_directory, session, redirect, url_for, Response
import random


application = Flask(__name__, static_folder='static', )
application.config['SECRET_KEY'] = 'the random string'

# ========================================================
# USER
# ========================================================
@application.route('/login', methods=['POST'])
def login():
    '''
    TODO:
        전반적인 화면단 validation
    '''
    if request.method == 'POST' and 'email' in request.form and 'pw' in request.form:

        email = request.form['email']
        pw = request.form['pw']

        dao_user = DataAccessObjectUser()
        response = dao_user.login(email, pw)
        if response['result']:
            session['loggedin'] = True
            session['usercode'] = response['usercode']
            session['email'] = response['email']
            session['username'] =  response['username']
            session['message'] = response["message"]
            session['expiration_date'] = response["expiration_date"]

            return jsonify({'result':True})

        else:

            session['loggedin'] = False
            session['message'] = response["message"]

            return jsonify({'result':False})

    else:
        return jsonify({'result': False, 'code': 400, 'message': 'Bad request'})

@application.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return redirect(url_for("home"),code=302)


@application.route('/registerForm', methods=['POST'])
def register():
    if request.method == 'POST' and \
            'email' in request.form and \
            'pw' in request.form and \
            'username' in request.form:

        email = request.form['email']
        pw = request.form['pw']
        username = request.form['username']

        dao_user = DataAccessObjectUser()
        if not  dao_user.check_dup(username):
            return jsonify({'result': False})
        else:
            dao_user.register(email, pw, username)
            return jsonify({'result': True})
    else:
        return jsonify({'result': False, 'code': 400, 'message': 'Bad request'})

@application.route('/profileForm', methods=['POST'])
def editProfile():
    if request.method == 'POST' and \
            'email' in request.form and \
            'pw' in request.form and \
            'username' in request.form:


        email = request.form['email']
        pw = request.form['pw']
        username = request.form['username']

        dao_user = DataAccessObjectUser()
        if not  dao_user.check_dup(username):
            return jsonify({'result': False})
        else:
            dao_user.register(email, pw, username)
            return jsonify({'result': True})

    else:
        return jsonify({'result': False, 'code': 400, 'message': 'Bad request'})

@application.route('/register', methods=['GET'])
def renderingRegisterPage():
    return render_template('register.html')

@application.route('/profile', methods=['GET'])
def renderingProfilePage():
    return render_template('profile.html')

@application.route('/getUserInfo', methods=['POST'])
def getUserInfo():
    if request.method == 'POST':
        sess = session_parser()
        return jsonify({'result':True,
                        'loggedin':sess['loggedin'],
                        'username':sess['username'],
                        'expiration_date':sess['expiration_date']})


@application.route('/getFavorite', methods=['POST'])
def getFavorite():
    if request.method == 'POST':
        dao = DataAccessObjectUser()
        sess = session_parser()
        stockcode_favorite = dao.get_favorite(sess['usercode'])['result']
        return jsonify(stockcode_favorite =  stockcode_favorite)

    else:
        return jsonify({'result': False, 'code': 400, 'message': 'Bad request'})


@application.route('/setFavorite', methods=['POST'])
def setFavorite():
    if request.method == 'POST' and 'stockcode_favorite' in request.form:
        stockcode_favorite = request.form['stockcode_favorite'].split(',')
        dao = DataAccessObjectUser()
        sess = session_parser()
        if sess['loggedin']==True:
            dao.set_favorite(usercode=sess['usercode'], stockcodes_new=stockcode_favorite)['result']
            return jsonify(result ="favorite updated")
        else:
            return jsonify(result ="login first")
    else:
        return jsonify({'result': False, 'code': 400, 'message': 'Bad request'})

@application.route('/getEmailConfirmationCode', methods=['POST'])
def getEmailConfirmationCode():
    if request.method == 'POST' and \
            'email' in request.form:
        email = request.form['email']
        confirmation_code = str(random.randint(0,999999)).zfill(6)
        session['confirmation_code'] = str(confirmation_code).zfill(6)

        send_mail(from_mail='jazztronomers@gmail.com',
                  to_mail=email,
                  app_pw=cf.MAIL_APP_PW,
                  code=confirmation_code)

        return jsonify({'result':True})

    else:
        return jsonify({'result': False, 'code': 400, 'message': 'Bad request'})

@application.route('/checkEmailConfirmationCode', methods=['POST'])
def checkConfirmationCode():
    if request.method == 'POST' and \
            'confirmation_code' in request.form:
        confirmation_code_from_client = request.form['confirmation_code']
        confirmation_code_at_session = session.get('confirmation_code')

        if confirmation_code_from_client == confirmation_code_at_session:

            return jsonify({'result': True})

        else:
            return jsonify({'result':False})
    else:
        return jsonify({'result': False, 'code': 400, 'message': 'Bad request'})

@application.route('/checkDupUsername', methods=['POST'])
def checkDupUsername():

    if request.method == 'POST' and \
            'username' in request.form:
        username = request.form['username']

        dao_user = DataAccessObjectUser()
        response = dao_user.check_dup(username)  # BOOL
        return jsonify({'result': response})

    else:
        return jsonify({'result': False, 'code': 400, 'message': 'Bad request'})

@application.route('/checkCurrentPassword', methods=['POST'])
def checkCurrentPassword():

    if request.method == 'POST' and \
            'curr_pw' in request.form:

        usercode = session.get('usercode')
        curr_pw = request.form['curr_pw']
        dao_user = DataAccessObjectUser()
        response = dao_user.check_curr_pw(usercode, curr_pw)  # BOOL
        return jsonify({'result': response})

    else:
        return jsonify({'result': False, 'code': 400, 'message': 'Bad request'})

def session_parser(init=False):
    '''
    TODO :
        즐찾종목또는 USER에 귀속된 모든 정보는 SESSION에 그대로 반환하도록
        init True인경우만


    '''
    email = session.get('email')
    username = session.get('username')
    usercode = session.get('usercode')
    loggedin = False if session.get('loggedin') is None else True
    message = session.get('message')
    favorite = session.get('favorite')
    expiration_date =session.get('expiration_date')

    return {'email':email,
            'username':username,
            'usercode': usercode,
            'loggedin':loggedin,
            'message':message,
            'favorite':favorite,
            'expiration_date':expiration_date}


# ========================================================
# STOCK
# ========================================================

@application.route('/ads.txt')
def static_from_root():
    return send_from_directory(application.static_folder, request.path[1:])


@application.route('/')
def home():
    return render_template('home.html', session=session_parser(), alert_message=session.get('message'))



# 화면을 요청하는 controller
@application.route('/ajaxTable', methods = ['POST'])
def ajax_getTable():
    '''
    TODO
        1. HTML을 SERVER SIDE 에서 RENDERING 하지 않고, CLIENT SIDE에서 RENDERING 하도록 본 함수에서는 JSON을 그대로 RETURN 하도록 수정
        2. SESSION정보에 따라서 불러오는 ROW수 또는 컬럼수를 조정해줘야한다.

    '''

    targets = request.form.get("targets").split(',')
    intervals = [int(interval) for interval in request.form.get("intervals").split(',')]
    orderby = "+".join(request.form.get("orderby").split(','))
    orderhow = request.form.get("orderhow")
    limit = request.form.get("limit")

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
    dao = DataAccessObjectStock()
    sess = session_parser()

    # 비회원
    if sess['loggedin'] == None or sess['loggedin'] == False:
        limit = 50
        usercode = -1

    # 회원
    else:
        if sess['expiration_date'] < str(datetime.now().date()):
            limit = 100
            usercode = -1

        # 후원자
        else:
            limit = 200
            usercode = sess['usercode']

    htmltable = dao.sndRankHtml(targets=targets, intervals=intervals, orderby=orderby, orderhow=orderhow, method='dataframe', limit=limit, usercode=usercode)
    return htmltable



@application.route('/ajaxRealtime', methods=['POST'])
def ajax_getRealtime():

    seq = request.form['seq'].replace('"', '')
    date = request.form['date'].replace('"', '')

    dao = DataAccessObjectStock()
    ret = dao.smar_realtime(date, seq)

    return jsonify(realtime=ret)




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

    return jsonify(sampledata=chartData, finantable=finantable)


@application.route('/ajaxRelated', methods=['POST'])
def ajax_getSndRelated():

    chartid = request.form['chartId'].replace('"', '')
    stockcode = request.form['stockcode'].replace('"', '')

    dao = DataAccessObjectStock()
    htmltable = dao.sndRelated(stockcode, chartid)

    return htmltable


@application.route('/getTableCsv', methods=['GET'])
def getTableFullCsv():

    dao = DataAccessObjectStock()
    sess = session_parser()

    filename_prefix = 'jazzstock_table_daily_full'
    the_date = '20210216'

    # 비회원
    if sess['loggedin'] == None or sess['loggedin'] == False:
        return jsonify({'result': False, "message": "supporters only"})

    # 회원
    else:
        # 일반회원
        if sess.get('expiration_date', '1970-01-01') < str(datetime.now().date()):
            return jsonify({'result': False, "message": "supporters only"})

        # 후원자
        else:
            output_stream = StringIO()
            df = dao.sndRank(order='I1+F1', by='DESC', method='dataframe', limit=20, usercode=0)
            df.to_csv(output_stream, encoding='euc-kr')

            response = Response(
                output_stream.getvalue(),
                mimetype='text/csv',
                content_type='text/csv',
            )
            response.headers["Content-Disposition"] = "attachment; filename=%s_%s.csv"%(filename_prefix, the_date)

            return response

@application.route('/getTradingDays', methods=['POST'])
def getRecentTradingDays():
    '''
    T_DATE_INDEXED에서 TOP 240 DATE를 가져오는 함수
    '''
    dao = DataAccessObjectStock()
    pass

@application.route('/getRecentTradingDayAndResultCount', methods=['POST'])
def getRecentTradingDayAndResultCount():
    '''
    최근거래일 총 데이터건수를 가져오는 함수
    '''
    dao = DataAccessObjectStock()
    pass





if __name__ == '__main__':
    application.run(debug=True, host='0.0.0.0', port=9002)
