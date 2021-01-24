from jazzstock_net.app.common import connector_db as db
from hashlib import sha256

class DataAccessObjectUser:

    def __init__(self):
        pass

    def register(self, id, pw, name):
        # CHECK EXISTS
        pw_encoded = sha256(pw.encode('utf-8')).hexdigest()
        print(' * REGISTER', id, name)


        ret = db.selectSingleValue('SELECT ID, NAME FROM jazzstockuser.T_USER_INFO')
        if len(ret) > 0:

            return {'result': False,
                    'message':'ID already exsists'}

        else:
            db.insert(f"INSERT INTO `jazzstockuser`.`T_USER_INFO` (`id`, `pw`, `name`) VALUES ('{id}', '{pw_encoded}', '{name}');")

            return {'result': True,
                    'message':'Success'}


        # INSERT

    def login(self, id, pw):
        pw_encoded = sha256(pw.encode('utf-8')).hexdigest()

        print(' * LOGIN', id, pw)
        response = db.selectpd(f'SELECT ID, NAME FROM jazzstockuser.T_USER_INFO WHERE ID = "{id}" AND PW = "{pw_encoded}"')


        if response is not None and len(response) > 0:
            ret = {'result': True,
                   'id':response.ID.values[0],
                   'name':response.NAME.values[0],
                   'message':'Success'}

        else:
            ret =  {'result': True,
                    'id': None,
                    'name': None,
                    'message':'Not exists user or password is wrong'}


        return ret
