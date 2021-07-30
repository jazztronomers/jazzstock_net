from flask import request, jsonify, session, redirect, url_for, Blueprint
from jazzstock_net.app.dao.dao_user import DataAccessObjectUser
from jazzstock_net.app.common.telegram_message import send_message_telegram
from datetime import datetime
from jazzstock_net.app.common.mail import send_mail
from jazzstock_net.app.config.config_message import alert_message
import jazzstock_net.app.config.config as cf
import random

application_user = Blueprint('user', __name__, url_prefix='/')

@application_user.route('/login', methods=['POST'])
def login():
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

@application_user.route('/logout', methods=['POST','GET'])
def logout():
    session.clear()
    return redirect(url_for("rendering_page_home"),code=302)


@application_user.route('/getTelegramConfirmationCode', methods=['POST'])
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
    

@application_user.route('/registerForm', methods=['POST'])
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

@application_user.route('/profileForm', methods=['POST'])
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

@application_user.route('/updateUsername', methods=['POST'])
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

@application_user.route('/updatePassword', methods=['POST'])
def updatePassword():
    if request.method == 'POST' and \
            'password' in request.form:

        password = request.form['password']
        dao_user = DataAccessObjectUser()
        result = dao_user.update_password(password, session.get('usercode'))
        return jsonify({'result': result})
    else:
        return jsonify({'result': False, 'code': 400, 'message': 'Bad request'})


@application_user.route('/getUserInfo', methods=['POST'])
def getUserInfo():
    if request.method == 'POST':
        return jsonify({'result': True,
                        'loggedin': session.get('loggedin'),
                        'username': session.get('username'),
                        'expiration_date': session.get('expiration_date')})


@application_user.route('/getFavorite', methods=['POST'])
def getFavorite():
    if request.method == 'POST':
        dao = DataAccessObjectUser()
        stockcode_favorite = dao.get_favorite(session.get('usercode'))['result']
        return jsonify(stockcode_favorite=stockcode_favorite)

    else:
        return jsonify({'result': False, 'code': 400, 'message': 'Bad request'})


@application_user.route('/setFavorite', methods=['POST'])
def setFavorite():
    member = _getMembership()
    if member.get("membership") == 'supporter':
        if request.method == 'POST' and 'stockcode_favorite' in request.form:
            stockcode_favorite = request.form['stockcode_favorite'].split(',')
            dao = DataAccessObjectUser()
            if session.get('loggedin') == True:
                result = dao.set_favorite(usercode=session.get('usercode'), stockcodes_new=stockcode_favorite)['result']
                return jsonify({'result': result})

            else:
                return jsonify({'result': False})
    else:
        return jsonify({'result': False, 'code': 400, 'message': alert_message['supporter_only_kr']})


@application_user.route('/getEmailConfirmationCode', methods=['POST'])
def getEmailConfirmationCode():
    if request.method == 'POST' and \
            'email' in request.form:
        email = request.form['email'].replace('"', '')

        dao = DataAccessObjectUser()
        email_dup = dao.check_dup_email(email)
        if email_dup:
            return jsonify({'result': False, 'message': "이미 가입된 이메일주소입니다, 비밀번호를 잊으셨다면 관리자에 문의주세요"})

        else:

            confirmation_code = str(random.randint(0, 999999)).zfill(6)
            session['confirmation_code'] = str(confirmation_code).zfill(6)

            send_mail(from_mail='jazztronomers@gmail.com',
                      to_mail=email,
                      app_pw=cf.MAIL_APP_PW,
                      code=confirmation_code)

            return jsonify({'result': True})

    else:
        return jsonify({'result': False, 'code': 400, 'message': 'Bad request'})


@application_user.route('/checkEmailConfirmationCode', methods=['POST'])
def checkConfirmationCode():
    if request.method == 'POST' and \
            'confirmation_code' in request.form:
        confirmation_code_from_client = request.form['confirmation_code']
        confirmation_code_at_session = session.get('confirmation_code')

        if confirmation_code_from_client == confirmation_code_at_session:

            return jsonify({'result': True})

        else:
            return jsonify({'result': False})
    else:
        return jsonify({'result': False, 'code': 400, 'message': 'Bad request'})


@application_user.route('/checkTelegramConfirmationCode', methods=['POST'])
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
            return jsonify({'result': False})
    else:
        return jsonify({'result': False, 'code': 400, 'message': 'Bad request'})


@application_user.route('/checkDupUsername', methods=['POST'])
def checkDupUsername():
    if request.method == 'POST' and \
            'username' in request.form:
        username = request.form['username']

        dao_user = DataAccessObjectUser()
        response = dao_user.check_dup(username)  # BOOL
        return jsonify({'result': response})

    else:
        return jsonify({'result': False, 'code': 400, 'message': 'Bad request'})


@application_user.route('/checkCurrentPassword', methods=['POST'])
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


@application_user.route('/updateUuid', methods=['POST'])
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
    if session.get('loggedin') == True:
        if session.get('expiration_date') > str(datetime.now().date()):
            return {'result': True, 'membership': 'supporter'}

        else:
            return {'result': True, 'membership': 'general'}

    else:
        return {'result': True, 'membership': 'non-member'}