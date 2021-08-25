from flask import request, jsonify, Blueprint, session
from jazzstock_net.app.dao.dao_simulation import DataAccessObjectSimulation
from jazzstock_net.app.dao.dao_user import DataAccessObjectUser
from datetime import datetime


application_customize = Blueprint('customize', __name__, url_prefix='/')

@application_customize.route('/setFeatureGroupOrder', methods=['POST'])
def setFeatureGroupOrder():
    '''
    최근거래일 총 데이터건수를 가져오는 함수
    '''

    if request.method == 'POST':

        feature_group_order = request.json.get("feature_group_order")
        dao = DataAccessObjectUser()
        result = dao.set_feature_group_order(usercode=session.get('usercode'), feature_group_order=feature_group_order)

        if result:
            session['feature_group_order'] = feature_group_order
            session['feature_group_order_parsed'] = [x.get("name") for x in feature_group_order if x.get("use_yn")]

        return {'result': result}





'''

META: STOCKNAME, FAV, MC, CLOSE
PROFIT: P{X}
SND_STRENGTH: I{X}, F{X}....
SND_RANK: IR, FR .....
MOVING_AVERAGE: PMA{X}, VMA{X}
BOLLINGER_BAND: BBP, BBW
FINAN: PER, PBR, ROE, CCR
CATEGORY: CATEGORY
REPORT: RTITLE, RDATE,


'''
