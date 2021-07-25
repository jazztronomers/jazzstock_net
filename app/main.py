from jazzstock_net.app.dao.dao_stock import DataAccessObjectStock
from jazzstock_net.app.dao.dao_user import DataAccessObjectUser
from jazzstock_net.app.dao.dao_simulation import DataAccessObjectSimulation
from jazzstock_net.app.common.mail import send_mail
from jazzstock_net.app.common.telegram_message import send_message_telegram
import jazzstock_net.app.config.config as cf
from jazzstock_net.app.config.config_message import alert_message
from jazzstock_net.app.config.config_table_specification import spec as spec_content
from io import StringIO
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_from_directory, session, redirect, url_for, Response, flash
import random, os


application = Flask(__name__, static_folder='static', )
application.config['SECRET_KEY'] = cf.FLASK_SECRET_KEY

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
            session['telegram_chat_id'] =  response['telegram_chat_id']
            session['message'] = response["message"]
            session['expiration_date'] = response["expiration_date"]

            return jsonify({'result':True})

        else:

            session['loggedin'] = False
            session['message'] = response["message"]

            return jsonify({'result':False})

    else:
        return jsonify({'result': False, 'code': 400, 'message': 'Bad request'})

@application.route('/logout', methods=['POST','GET'])
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
        if not dao_user.check_dup(username):
            return jsonify({'result': False})
        else:
            result = dao_user.register(email, pw, username)
            return jsonify(result)
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
        if not dao_user.check_dup(username):
            return jsonify({'result': False})
        else:
            dao_user.register(email, pw, username)
            return jsonify({'result': True})

    else:
        return jsonify({'result': False, 'code': 400, 'message': 'Bad request'})

@application.route('/updateUsername', methods=['POST'])
def updateUsername():
    if request.method == 'POST' and \
            'username' in request.form:

        updated_username = request.form['username']
        dao_user = DataAccessObjectUser()
        result = dao_user.update_username(updated_username, session.get('usercode'))

        if result:
            session['username']=updated_username

        return jsonify({'result': result})
    else:
        return jsonify({'result': False, 'code': 400, 'message': 'Bad request'})

@application.route('/updatePassword', methods=['POST'])
def updatePassword():
    if request.method == 'POST' and \
            'password' in request.form:

        password = request.form['password']
        dao_user = DataAccessObjectUser()
        result = dao_user.update_password(password, session.get('usercode'))
        return jsonify({'result': result})
    else:
        return jsonify({'result': False, 'code': 400, 'message': 'Bad request'})



@application.route('/register', methods=['GET'])
def renderingRegisterPage():
    return render_template('register.html')

@application.route('/profile', methods=['GET'])
def renderingProfilePage():

    if session.get('loggedin') == True:


        return render_template('profile.html', username=session.get('username','zzzzzz'), telegram_chat_id=session.get('telegram_chat_id',None))
    else:
        return redirect(url_for("home"),code=302)  #

@application.route('/getUserInfo', methods=['POST'])
def getUserInfo():
    if request.method == 'POST':
        return jsonify({'result':True,
                        'loggedin':session.get('loggedin'),
                        'username':session.get('username'),
                        'expiration_date':session.get('expiration_date')})


@application.route('/getFavorite', methods=['POST'])
def getFavorite():
    if request.method == 'POST':
        dao = DataAccessObjectUser()
        stockcode_favorite = dao.get_favorite(session.get('usercode'))['result']
        return jsonify(stockcode_favorite =  stockcode_favorite)

    else:
        return jsonify({'result': False, 'code': 400, 'message': 'Bad request'})


@application.route('/setFavorite', methods=['POST'])
def setFavorite():
    member = _getMembership()
    if member.get("membership") == 'supporter':
        if request.method == 'POST' and 'stockcode_favorite' in request.form:
            stockcode_favorite = request.form['stockcode_favorite'].split(',')
            dao = DataAccessObjectUser()
            if session.get('loggedin')==True:
                result = dao.set_favorite(usercode=session.get('usercode'), stockcodes_new=stockcode_favorite)['result']
                return jsonify({'result': result})

            else:
                return jsonify({'result': False})
    else:
        return jsonify({'result': False, 'code': 400, 'message': alert_message['supporter_only_kr']})

@application.route('/getEmailConfirmationCode', methods=['POST'])
def getEmailConfirmationCode():
    if request.method == 'POST' and \
            'email' in request.form:
        email = request.form['email'].replace('"','')
        
        dao = DataAccessObjectUser()
        email_dup = dao.check_dup_email(email)
        if email_dup:
            return jsonify({'result':False, 'message':"이미 가입된 이메일주소입니다, 비밀번호를 잊으셨다면 관리자에 문의주세요"})
            
        else:
        
            confirmation_code = str(random.randint(0,999999)).zfill(6)
            session['confirmation_code'] = str(confirmation_code).zfill(6)
    
            send_mail(from_mail='jazztronomers@gmail.com',
                      to_mail=email,
                      app_pw=cf.MAIL_APP_PW,
                      code=confirmation_code)
    
            return jsonify({'result':True})

    else:
        return jsonify({'result': False, 'code': 400, 'message': 'Bad request'})


@application.route('/getTelegramConfirmationCode', methods=['POST'])
def getTelegramConfirmationCode():
    if request.method == 'POST' and \
            'telegram_chat_id' in request.form:
        telegram_chat_id = request.form['telegram_chat_id'].replace('"', '')

        dao = DataAccessObjectUser()
        telegram_chat_id_dup = dao.check_dup_telegram(telegram_chat_id)
        if telegram_chat_id_dup:
            return jsonify({'result': False, 'message': "이미 가입된 탤래그램 CHAT_ID 입니다"})

        else:

            confirmation_code_telegram = str(random.randint(0, 999999)).zfill(6)
            session['confirmation_code_telegram'] = str(confirmation_code_telegram).zfill(6)
            ret = send_message_telegram("jazzstock.net에 \nTelegram계정을 등록하는 인증코드입니다:\n%s"%(confirmation_code_telegram), to=telegram_chat_id)

            if(isinstance(ret, dict)):
                return jsonify({'result': True, 'message':ret})

            else:
                return jsonify({'result': False, 'message':ret})

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


@application.route('/checkTelegramConfirmationCode', methods=['POST'])
def checkTelegramConfirmationCode():
    if request.method == 'POST' and \
            'confirmation_code_telegram' in request.form and \
            'telegram_chat_id' in request.form:
        confirmation_code_from_client = request.form['confirmation_code_telegram']
        confirmation_code_at_session = session.get('confirmation_code_telegram')
        telegram_chat_id = request.form['telegram_chat_id']

        if confirmation_code_from_client == confirmation_code_at_session:
            dao = DataAccessObjectUser()
            dao.set_telegram_chat_id(session.get('usercode'), telegram_chat_id)
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

@application.route('/updateUuid', methods=['POST'])
def updateUuid():

    if "uuid" in request.form:

        dao = DataAccessObjectUser()
        uuid = request.form.get('uuid')
        usercode = session.get('usercode')
        response = dao.update_uuid(usercode, uuid)


        return jsonify({'result': response})

    else:
        return jsonify({'result': False, 'code': 400, 'message': 'Bad request'})

def _getMembership():
    if session.get('loggedin')==True:
        if session.get('expiration_date') > str(datetime.now().date()):
            return {'result': True, 'membership': 'supporter'}

        else:
            return {'result': True, 'membership': 'general'}

    else:
        return {'result': True, 'membership': 'non-member'}


# ========================================================
# STOCK
# ========================================================


@application.route('/ads.txt')
def static_from_root():
    return send_from_directory(application.static_folder, request.path[1:])


@application.route('/')
def home():
    return render_template('home.html',
                           username=session.get('username','Guest'),
                           expiration_date=str(session.get('expiration_date',None)),
                           alert_message=session.get('message'))






# 화면을 요청하는 controller
@application.route('/ajaxTable', methods = ['POST'])
def ajax_getTable():
    '''
    '''

    targets = request.form.get("targets").split(',')
    intervals = [int(interval) for interval in request.form.get("intervals").split(',')]
    orderby = "+".join(request.form.get("orderby").split(','))
    orderhow = request.form.get("orderhow")
    limit = int(request.form.get("limit"))
    only_supporter = True if request.form.get("only_supporter") == 'true' else False
    fav_only = True if request.form.get("fav_only") in [True, "true"] else False
    report_only = True if request.form.get("report_only") in [True, "true"] else False
    try:
        date_idx = int(request.form.get("date_idx", 0))
    except:
        date_idx = 0

    dao = DataAccessObjectStock()
    member = _getMembership()


    # 후원자인경우

    if member.get("membership")=='supporter':
        limit = limit
        usercode = session.get('usercode')
        htmltable, column_list = dao.sndRankHtml(targets=targets, intervals=intervals, orderby=orderby, orderhow=orderhow,
                                    method='dataframe', limit=limit, usercode=usercode, fav_only=fav_only, report_only=report_only, date_idx=date_idx)




        return jsonify(htmltable=htmltable, column_list=column_list, result=True)


    # 후원자가 아닌경우
    else:

        if only_supporter:
            return jsonify({'result': False, "message": alert_message['supporter_only_kr']})

        else:
            if member.get("membership") == 'general':
                limit = min(50, limit)
                usercode = -1
            else:
                limit = min(25, limit)
                usercode = -1

            htmltable, column_list = dao.sndRankHtml(targets=targets, intervals=intervals, orderby=orderby, orderhow=orderhow,
                                        method='dataframe', limit=limit, usercode=usercode, report_only=report_only, fav_only=fav_only)

            return jsonify(htmltable=htmltable, column_list=column_list)





# @application.route('/ajaxRealtime', methods=['POST'])
# def ajax_getRealtime():
#
#     seq = request.form['seq'].replace('"', '')
#     date = request.form['date'].replace('"', '')
#
#     dao = DataAccessObjectStock()
#     ret = dao.smar_realtime(date, seq)
#
#     return jsonify(realtime=ret)



@application.route('/getTableForOhlcDay', methods=['POST'])
def getTableForOhlcDay():
    '''
    CHART데이터는 Javascript단에서 최대한 빠르게 RENDERING 할 수 있는 자료구조로 처리해서 반환한다
    빠른반복과 적은 트래픽이 오가는게 관건
    '''

    stockcode = request.form['stockcode'].replace('"', '')

    dao = DataAccessObjectStock()
    ohlc_day_data = dao.ohlcDay(stockcode)

    return jsonify(ohlc_day_data=ohlc_day_data)

@application.route('/getTableForSummary', methods=['POST'])
def getTableForSummary():
    '''
    CHART데이터는 Javascript단에서 최대한 빠르게 RENDERING 할 수 있는 자료구조로 처리해서 반환한다
    빠른반복과 적은 트래픽이 오가는게 관건
    '''

    stockcode = request.form['stockcode'].replace('"', '')

    dao = DataAccessObjectStock()
    snd_day_data = dao.sndDay(stockcode)
    finan_data, finan_html_table, column_list = dao.finanTable(stockcode)


    return jsonify(snd_day_data=snd_day_data, finan_data=finan_data,
                   finan_html_table=finan_html_table, column_list=column_list)




@application.route('/ajaxRelated', methods=['POST'])
def ajax_getSndRelated():

    chartid = request.form['chartId'].replace('"', '')
    stockcode = request.form['stockcode'].replace('"', '')

    dao = DataAccessObjectStock()
    htmltable = dao.sndRelated(stockcode, chartid)

    return htmltable


@application.route('/getTableCsv', methods=['GET'])
def getTableFullCsv():

    date_idx = int(request.args.get('day',0))
    dao = DataAccessObjectStock()

    filename_prefix = 'jazzstock_table_daily_full'
    the_date = dao.recent_trading_days(limit=10)[date_idx]
    member=_getMembership()

    if member.get("membership") == 'supporter':
        output_stream = StringIO()

        df = dao.sndRank(targets=['P', 'I', 'F', 'YG', 'S', 'T', 'OC', 'FN'], intervals=[1, 5, 20, 60], orderby='I1+F1',
                         orderhow='DESC', method='dataframe', limit=2500, usercode=0, date_idx=date_idx)
        df.to_csv(output_stream, encoding='euc-kr', index=False)

        response = Response(
            output_stream.getvalue(),
            mimetype='text/csv',
            content_type='text/csv',
        )
        response.headers["Content-Disposition"] = "attachment; filename=%s_%s.csv" % (filename_prefix, the_date)
        return response

    else:
        return jsonify({'result': False, "message": alert_message['supporter_only_en']})





@application.route('/getRecentTradingDays', methods=['POST'])
def getRecentTradingDays():
    '''
    T_DATE_INDEXED에서 TOP 240 DATE를 가져오는 함수
    '''
    dao = DataAccessObjectStock()
    recent_trading_days_list = dao.recent_trading_days(limit=720)
    return jsonify({'result': True, "content": recent_trading_days_list})




@application.route('/getSpecification', methods=['POST'])
def getSpecification():
    '''
    최근거래일 총 데이터건수를 가져오는 함수
    '''

    return jsonify(spec_content)



@application.route('/getLastTradingDaysLastSeq', methods=['POST'])
def getLastTradingDaysLastSeq():
    '''
    최근거래일 총 데이터건수를 가져오는 함수
    '''

    dao = DataAccessObjectStock()
    date_0, date_1, seq_max_date_0, seq_max = dao.get_last_trading_days_last_seq()
    return jsonify({'result':True,
                    'date_zero': date_0, 'date_one':date_1, 'seq_max_date_zero':seq_max_date_0, 'seq_max':seq_max})



@application.route('/getRealtimeTableHTML', methods=['POST'])
def getRealtimeTableHTML():
    '''
    최근거래일 총 데이터건수를 가져오는 함수
    '''

    if request.method == 'POST':
        limit = request.form.get('limit')
        the_date = request.form.get('the_date')

        print(' * getRealtimeTableHTML:', limit, the_date)

        dao = DataAccessObjectStock()
        ret= dao.realtime_table_html(limit=limit, the_date=the_date)

        htmltable = ret.get('html')
        column_list = ret.get('column_list')
        stocknames = ret.get('stocknames')

        return jsonify(htmltable=htmltable,\
                       column_list=column_list,
                       stocknames=stocknames,
                       result=True)


@application.route('/fetchRowsRealtime', methods=['POST'])
def fetchRowsRealtime():
    '''
    최근거래일 총 데이터건수를 가져오는 함수
    '''

    if request.method == 'POST':
        the_date = request.form.get('the_date')
        seq_max = int(request.form.get('seq_max'))

        print(' * fetchRows...', seq_max, the_date)

        dao = DataAccessObjectStock()
        now = datetime.now()
        now_date = str(now.date())
        now_time = str(now.time())
        if now.weekday() < 5 and now_time > '08:40:00.000000':
            print(" * 전일 기준으로 fetch")
            ret = dao.fetch(the_date = now_date, seq=seq_max)
        else:
            print(" * 최근거래일 일자로 fetch")
            ret = dao.fetch(the_date = the_date, seq=seq_max)
        return jsonify(ret)

@application.route('/getSimulationResult', methods=['POST'])
def getSimulationResult():
    '''
    최근거래일 총 데이터건수를 가져오는 함수
    '''

    if request.method == 'POST':

        from_date = request.json.get("from_date")
        to_date = request.json.get("to_date")

        condition_set = []
        for i, row in enumerate(request.json.get("condition_set")):
            condition_set.append(row)
        start_time = datetime.now()
        dao = DataAccessObjectSimulation()
        ret = dao.get_simulation_result_direct(from_date, to_date, condition_set)
        elapsed_time = datetime.now() - start_time


        return jsonify(simulation_result_table_html=ret.get('simulation_result_table_html'),
                       simulation_result_table_json=ret.get('simulation_result_table_json'),
                       simulation_result_column_list=ret.get('simulation_result_column_list'),
                       elapsed_time=elapsed_time.total_seconds())

@application.route('/saveConditionSetToServer', methods=['POST'])
def saveConditionSetToServer():
    '''
    최근거래일 총 데이터건수를 가져오는 함수
    '''

    if request.method == 'POST':
        # features_rows = []
        # for i, row in enumerate(request.json.get("condition_set")):
        #     features_rows.append(row)
        #
        # features_name = request.json.get("features_name")
        dao = DataAccessObjectSimulation()
        ret = dao.set_simulation_conditions(request.json, session.get('usercode'))
        print(request.json)
        return jsonify({"yo": "yo"})

        #
        # html, column_list = dao.set_simulation_features(features_rows, features_name, session.get('usercode'))
        # return jsonify(simulation_result_table_html=html, simulation_result_column_list=column_list)



@application.route('/getConditionSetsFromServer', methods=['POST'])
def getConditionSetsFromServer():
    '''
    최근거래일 총 데이터건수를 가져오는 함수
    '''

    if request.method == 'POST':

        dao = DataAccessObjectSimulation()
        ret = dao.get_simulation_conditions(session.get('usercode'))

        return jsonify(ret)

        #
        # html, column_list = dao.set_simulation_features(features_rows, features_name, session.get('usercode'))
        # return jsonify(simulation_result_table_html=html, simulation_result_column_list=column_list)

@application.route('/test', methods=['POST'])
def test():
    '''
    최근거래일 총 데이터건수를 가져오는 함수
    '''

    print(request.json)
    return jsonify({"yo":"yo"})


# @application.route('/getReportHK', methods=['GET'])
# def getReportFromHK():
#
#
#     rid = int(request.args.get('rid', 0))
#     member=_getMembership()
#
#     if member.get("membership") == 'supporter':
#
#         if os.isfile(os.path.join(path_pdf, rid)):
#
#
#
#         response = Response(
#             output_stream.getvalue(),
#             mimetype='application/pdf',
#             content_type='application/pdf',
#         )
#         response.headers["Content-Disposition"] = "attachment; filename=%s_%s.csv" % (filename_prefix, the_date)
#         return response
#
#     else:
#         return jsonify({'result': False, "message": alert_message['supporter_only_en']})



if __name__ == '__main__':
    application.run(debug=True, host='0.0.0.0', port=9002)
