from jazzstock_net.app.common import connector_db as db
from jazzstock_net.app.config import config_others as co
from hashlib import sha256
from datetime import datetime
from datetime import timedelta
import json

# Config
free_period = co.FREE_PERIOD


class DataAccessObjectUser:

    def __init__(self, usercode=None):

        self.usercode = usercode

    def function(self):
        '''
        기본 응답은 아래 dictionary를 기본으로 한다
        '''

        return {
            'result':"함수의 응답결과, Boolean Or Object",
            'message':"화면단에 ALERTING 할 메세지"
        }


    def register(self, email, pw, username):
        # CHECK EXISTS
        pw_encoded = sha256(pw.encode('utf-8')).hexdigest()
        print(' * REGISTER', email, username)


        email_dup = self.check_dup_email(email)
        if email_dup:

            return {'result': False,
                    'message':'email already exsists'}

        else:
            now = datetime.now()

            # 회원추가
            # db.insert(f"INSERT INTO `jazzstockuser`.`T_USER_INFO` (`EMAIL`, `PASSWORD`, `USERNAME`, `TIMESTAMP`) VALUES ('{email}', '{pw_encoded}', '{username}', '{now}');")
            db.insert("INSERT INTO `jazzstockuser`.`T_USER_INFO` (`EMAIL`, `PASSWORD`, `USERNAME`, `TIMESTAMP`) VALUES ('%s', '%s', '%s', '%s');"%(email, pw_encoded, username, now))
            usercode = db.selectSingleValue("SELECT USERCODE FROM jazzstockuser.T_USER_INFO WHERE EMAIL = '%s'"%(email))

            now = datetime.now()
            today = str(now.date())
            expiration_date = str((now + timedelta(days=free_period)).date())

            # 도네이션정보 데이터생성 - 초기화
            # db.insert(f"INSERT INTO `jazzstockuser`.`T_USER_DONATION` (`USERCODE`, `DONATE_DATE`, `EXPIRATION_DATE`) VALUES ('{usercode}', '{today}', '{expiration_date}');")
            db.insert("INSERT INTO `jazzstockuser`.`T_USER_DONATION` (`USERCODE`, `DONATE_DATE`, `EXPIRATION_DATE`) VALUES ('%s', '%s', '%s');"%(usercode, today, expiration_date))

            return {'result': True,
                    'message':'Success'}

    def check_dup_email(self, email):

        ret = db.selectSingleValue("SELECT USERCODE FROM jazzstockuser.T_USER_INFO WHERE EMAIL='%s'" % (email))
        if ret is None:
            return False # 이메일 존재함
        else:
            return True # 이메일 존재하지 않음


    # INSERT

    def login(self, email, pw):
        pw_encoded = sha256(pw.encode('utf-8')).hexdigest()
        query = '''
                SELECT USERCODE, EMAIL, USERNAME, CAST(EXPIRATION_DATE AS CHAR) AS EXPIRATION_DATE, TELEGRAM, CAST(FEATURE_GROUP_ORDER AS CHAR) AS FEATURE_GROUP_ORDER
                FROM jazzstockuser.T_USER_INFO
                JOIN jazzstockuser.T_USER_DONATION USING (USERCODE)
                LEFT JOIN jazzstockuser.T_USER_FEATURE_GROUP_ORDER USING (USERCODE)
                WHERE 1=1
                AND EMAIL = "%s" 
                AND PASSWORD = "%s"
                '''%(email, pw_encoded)
        response = db.selectpd(query)
        if response is not None and len(response) > 0:

            feature_group_order = response.FEATURE_GROUP_ORDER.values[0]

            if feature_group_order:
                feature_group_order_parsed = []
                for x in json.loads(feature_group_order):
                    if x.get("use_yn"):
                        feature_group_order_parsed.append(x.get("name"))
            else:
                feature_group_order_parsed = None

            ret = {'result': True,
                   'message':'Welcome, %s'%(response.USERNAME.values[0]),
                   'usercode':str(response.USERCODE.values[0]),
                   'email': response.EMAIL.values[0],
                   'username': response.USERNAME.values[0],
                   'telegram_chat_id': response.TELEGRAM.values[0],
                   'expiration_date':response.EXPIRATION_DATE.values[0],
                   'feature_group_order': response.FEATURE_GROUP_ORDER.values[0],
                   'feature_group_order_parsed': feature_group_order_parsed
                   }

        else:
            ret =  {'result': False,
                    'message':'Username not found or password is wrong',
                    'usercode':None,
                    'email': None,
                    'username': None,
                    'telegram_chat_id': None,
                    'expiration_date':None}


        return ret

    '''
    ============================================================================================
    jazzstockuser TABLE 설계
    ============================================================================================
    
    T_USER_INFO
        USERCODE, EMAIL, PW, NAME, TIMESTAMP
    
    T_USER_PAYMENT ** 
        USERCODE, TIMESTAMP, EXPIRATION DATE
        
    T_USER_STOCK_INTERESTED
        USERCODE, STOCKCODE, TIMESTAMP
        
    T_USER_STOCK_VIEWED
        USERCODE, STOCKCODE, TIMESTAMP
        
    '''

    def get_favorite(self, usercode, delyn = False):

        '''
        usercode : usercode
        delyn : 이전에 즐찾했다가 삭제한 종목도 뽑을것인가? True False

        '''

        # SELECT QUERY

        if delyn:
            DELYN = '(0,1)'
        else:
            DELYN = '(0)'

        query = '''SELECT STOCKCODE, LEFT(TIMESTAMP,10) AS FAV_DATE
                    FROM jazzstockuser.T_USER_STOCK_FAVORITE
                    JOIN jazzdb.T_STOCK_CODE_MGMT USING (STOCKCODE)
                    WHERE 1=1 
                    AND USERCODE="%s"
                    AND DELYN IN %s
                    ORDER BY TIMESTAMP DESC 
                '''%(usercode, DELYN)

        df = db.selectpd(query)
        if len(df)>0:
            ret = {'result': df.values.tolist(),
                   'message': 'interested stockcodes',
                   'id': None,
                   'name': None}
        else:
            ret = {'result': [],
                   'message': 'There is no registered interested item',
                   'id': None,
                   'name': None}

        return ret

    def set_favorite(self, usercode, stockcodes_new):

        stockcode_favdate_list_old = self.get_favorite(usercode)['result']

        if stockcodes_new == [""]:
            stockcodes_new = []

        if len(stockcodes_new) > 0:
            for stockcode in stockcodes_new:
                if stockcode not in [x[0] for x in stockcode_favdate_list_old] and stockcode != '':

                    now = datetime.now()
                    query = '''INSERT INTO jazzstockuser.T_USER_STOCK_FAVORITE (USERCODE, STOCKCODE, GRP, TIMESTAMP, DELYN) VALUES(%s, "%s", "A", "%s", 0) ON DUPLICATE KEY UPDATE DELYN = 0, TIMESTAMP = "%s"'''%(usercode, stockcode, now, now)
                    db.insert(query)

        for stockcode, fav_date in stockcode_favdate_list_old:
            if stockcode not in stockcodes_new or len(stockcodes_new) == 0:
                query = '''UPDATE `jazzstockuser`.`T_USER_STOCK_FAVORITE` SET `TIMESTAMP_LAST` = '%s', `TIMESTAMP` = '%s', `DELYN` = '1' WHERE (`USERCODE` = %s) and (`STOCKCODE` = '%s') and (`DELYN` = '0');'''%(fav_date, datetime.now(), usercode, stockcode)
                db.insert(query)



        # NEW에 있고 ORIGIN에 없으면 INSERT
        # NEW에 있고 ORIGIN에 있으면 KEEP
        # NEW에 없고 ORIGIN에 있으면 DELETE




        if True:
            ret = {'result': True}
        else:
            ret = {'result': False}

        return ret




#     def get_viewed(self):

#         query = F'SELECT STOCKCODE FROM jazzstockuser.T_USER_STOCK_VIEWED WHERE 1=1 AND USERCODE="{self.usercode}" ORDER BY TIMESTAMP DESC LIMIT 100'
#         df = db.selectpd(query)


#         if len(df)>0:
#             ret = {'result': df.STOCKCODE.values.tolist(),
#                    'message': 'interested stockcodes',
#                    'id': None,
#                    'name': None}
#         else:
#             ret = {'result': None,
#                    'message': 'There is no registered interested item',
#                    'id': None,
#                    'name': None}

#     def set_viewed(self):
#         pass

    def check_dup(self, username):

        query = "SELECT COUNT(*) FROM jazzstockuser.T_USER_INFO WHERE USERNAME = '%s'"%(username)
        count = db.selectSingleValue(query)

        if count == 0:
            return True
        else:
            return False

    def check_curr_pw(self, usercode, curr_pw):

        curr_pw_input = sha256(curr_pw.encode('utf-8')).hexdigest()
        query = "SELECT PASSWORD FROM jazzstockuser.T_USER_INFO WHERE USERCODE = '%s'"%(usercode)
        curr_pw_db = db.selectSingleValue(query)

        if curr_pw_input == curr_pw_db:
            return True

        else:
            return False

    def update_username(self, new_username, usercode):

        if self.check_dup(new_username):
            query = '''UPDATE `jazzstockuser`.`T_USER_INFO` SET `USERNAME` = '%s' WHERE (`USERCODE` = '%s');'''%(new_username, usercode)
            try:
                db.insert(query)
                return True

            except Exception as e:
                return False

        else:
            return False

    def update_password(self, new_password, usercode):

        new_password_encoded = sha256(new_password.encode('utf-8')).hexdigest()
        query = '''UPDATE `jazzstockuser`.`T_USER_INFO` SET `PASSWORD` = '%s' WHERE (`USERCODE` = '%s');'''%(new_password_encoded, usercode)
        try:
            db.insert(query)
            return True

        except Exception as e:
            return False


    def update_uuid(self, usercode, uuid):

        # 같은 UUID가 DB에 이미 존재하는경우

        df = db.selectpd('''SELECT USERCODE, UUID, LOGINCNT FROM jazzstockuser.T_USER_UUID WHERE USERCODE = "%s" AND UUID = "%s"'''%(usercode, uuid))
        current_time = datetime.now()

        try:
            # 같은 UUID가 DB에 이미 존재하는경우
            if len(df) >0:
                query = '''
                UPDATE `jazzstockuser`.`T_USER_UUID` SET `LASTLOGINED` = '%s', `LOGINCNT` = '%s' 
                WHERE (`USERCODE` = '%s') and (`UUID` = '%s');
                '''%(current_time, int(df.LOGINCNT.values[0])+1, usercode, uuid)
                db.insert(query)

            # 같은 UUID가 존재하지 않는경우
            else:
                query = '''
                INSERT INTO `jazzstockuser`.`T_USER_UUID` (`USERCODE`, `UUID`, `TIMESTAMP`, `LASTLOGINED`, `LOGINCNT`) 
                VALUES ('%s', '%s', '%s', '%s', '%s');
                '''%(usercode, uuid, current_time, current_time, 1)
                db.insert(query)

            return True

        except Exception as e:
            return False


    def check_dup_telegram(self, chat_id):

        ret = db.selectSingleValue("SELECT USERCODE FROM jazzstockuser.T_USER_INFO WHERE TELEGRAM='%s'" % (chat_id))
        if ret is None:
            return False  # 이메일 존재함
        else:
            return True  # 이메일 존재하지 않음

    def set_telegram_chat_id(self, usercode, chat_id):

        query = '''
        UPDATE `jazzstockuser`.`T_USER_INFO` SET `TELEGRAM` = '%s' WHERE (`USERCODE` = '%s');        
        '''%(chat_id, usercode)

        db.insert(query)

        return True

    def set_feature_group_order(self, usercode, feature_group_order):

        try:
            if isinstance(feature_group_order, dict) or isinstance(feature_group_order, list):
                feature_group_order = json.dumps(feature_group_order)
            query = '''
            INSERT INTO `jazzstockuser`.`T_USER_FEATURE_GROUP_ORDER` (`USERCODE`, `FEATURE_GROUP_ORDER`) VALUES ('%s', '%s')
            ON DUPLICATE KEY UPDATE USERCODE='%s', FEATURE_GROUP_ORDER='%s' 
            '''%(usercode, feature_group_order, usercode, feature_group_order)

            db.insert(query)
            return True

        except Exception as e:
            print(e)
            return False

    # def get_feature_group_order(self, usercode):
    #
    #     try:
    #         query = '''
    #         SELECT FEATURE_GROUP_ORDER FROM jazzstockuser.T_USER_FEATURE_GROUP_ORDER WHERE USERCODE = '6'
    #         '''%(usercode)
    #         feature_group = db.selectSingleValue(query)
    #         return feature_group
    #
    #     except Exception as e:
    #         print(e)
    #         return False
