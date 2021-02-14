from jazzstock_net.app.common import connector_db as db
from hashlib import sha256
from datetime import datetime
from datetime import timedelta

# Config
free_period = 10


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
        print(' * REGISTER', id, username)


        ret = db.selectSingleValue(F"SELECT USERCODE FROM jazzstockuser.T_USER_INFO WHERE EMAIL='{email}'")
        if ret is not None and len(ret) > 0:

            return {'result': False,
                    'message':'ID already exsists'}

        else:
            now = datetime.now()

            # 회원추가
            db.insert(f"INSERT INTO `jazzstockuser`.`T_USER_INFO` (`EMAIL`, `PASSWORD`, `USERNAME`, `TIMESTAMP`) VALUES ('{email}', '{pw_encoded}', '{username}', '{now}');")
            usercode = db.selectSingleValue(f"SELECT USERCODE FROM jazzstockuser.T_USER_INFO WHERE EMAIL = '{email}'")

            now = datetime.now()
            today = str(now.date())
            expiration_date = str((now + timedelta(days=free_period)).date())

            # 도네이션정보 데이터생성 - 초기화
            db.insert(f"INSERT INTO `jazzstockuser`.`T_USER_DONATION` (`USERCODE`, `DONATE_DATE`, `EXPIRATION_DATE`) VALUES ('{usercode}', '{today}', '{expiration_date}');")


            return {'result': True,
                    'message':'Success'}


        # INSERT

    def login(self, email, pw):
        pw_encoded = sha256(pw.encode('utf-8')).hexdigest()
        response = db.selectpd(f'''
                                SELECT USERCODE, EMAIL, USERNAME, EXPIRATION_DATE
                                FROM jazzstockuser.T_USER_INFO
                                JOIN jazzstockuser.T_USER_DONATION USING (USERCODE)
                                WHERE 1=1
                                AND EMAIL = "{email}" 
                                AND PASSWORD = "{pw_encoded}"
                                ''')


        if response is not None and len(response) > 0:
            ret = {'result': True,
                   'message':'Welcome, %s'%(response.USERNAME.values[0]),
                   'usercode':str(response.USERCODE.values[0]),
                   'email': response.EMAIL.values[0],
                   'username': response.USERNAME.values[0],
                   'expiration_date':response.EXPIRATION_DATE.values[0]}

        else:
            ret =  {'result': False,
                    'message':'Username not found or password is wrong',
                    'usercode':None,
                    'email': None,
                    'username': None,
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

        query = F'''SELECT STOCKCODE, LEFT(TIMESTAMP,10) AS FAV_DATE
                    FROM jazzstockuser.T_USER_STOCK_FAVORITE
                    JOIN jazzdb.T_STOCK_CODE_MGMT USING (STOCKCODE)
                    WHERE 1=1 
                    AND USERCODE="{usercode}"
                    AND DELYN IN {DELYN}
                    ORDER BY TIMESTAMP DESC 
                '''

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
        if len(stockcodes_new) > 0:
            for stockcode in stockcodes_new:
                if stockcode not in [x[0] for x in stockcode_favdate_list_old] and stockcode != '':

                    now = datetime.now()
                    query = f'''INSERT INTO jazzstockuser.T_USER_STOCK_FAVORITE (USERCODE, STOCKCODE, GRP, TIMESTAMP, DELYN) VALUES({usercode}, "{stockcode}", "A", "{now}", 0) ON DUPLICATE KEY UPDATE DELYN = 0, TIMESTAMP = "{now}"'''
                    db.insert(query)

        for stockcode, fav_date in stockcode_favdate_list_old:
            if stockcode not in stockcodes_new or len(stockcodes_new) == 0:
                query = f'''UPDATE `jazzstockuser`.`T_USER_STOCK_FAVORITE` SET `TIMESTAMP_LAST` = '{fav_date}', `TIMESTAMP` = '{datetime.now()}', `DELYN` = '1' WHERE (`USERCODE` = {usercode}) and (`STOCKCODE` = '{stockcode}') and (`DELYN` = '0');'''
                db.insert(query)



        # NEW에 있고 ORIGIN에 없으면 INSERT
        # NEW에 있고 ORIGIN에 있으면 KEEP
        # NEW에 없고 ORIGIN에 있으면 DELETE




        if True:
            ret = {'result': 'a',
                   'message': 'interested stockcodes',
                   'id': None,
                   'name': None}
        else:
            ret = {'result': None,
                   'message': 'There is no registered interested item',
                   'id': None,
                   'name': None}

        return ret




    def get_viewed(self):

        query = F'SELECT STOCKCODE FROM jazzstockuser.T_USER_STOCK_VIEWED WHERE 1=1 AND USERCODE="{self.usercode}" ORDER BY TIMESTAMP DESC LIMIT 100'
        df = db.selectpd(query)


        if len(df)>0:
            ret = {'result': df.STOCKCODE.values.tolist(),
                   'message': 'interested stockcodes',
                   'id': None,
                   'name': None}
        else:
            ret = {'result': None,
                   'message': 'There is no registered interested item',
                   'id': None,
                   'name': None}

    def set_viewed(self):
        pass

    def check_dup(self, username):

        query = F"SELECT COUNT(*) FROM jazzstockuser.T_USER_INFO WHERE USERNAME = '{username}'"
        count = db.selectSingleValue(query)

        if count == 0:
            return True
        else:
            return False

    def check_curr_pw(self, usercode, curr_pw):

        curr_pw_input = sha256(curr_pw.encode('utf-8')).hexdigest()
        query = F"SELECT PASSWORD FROM jazzstockuser.T_USER_INFO WHERE USERCODE = '{usercode}'"
        curr_pw_db = db.selectSingleValue(query)

        if curr_pw_input == curr_pw_db:
            return True

        else:
            return False


