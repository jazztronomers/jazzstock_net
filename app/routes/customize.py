from flask import request, jsonify, Blueprint
from jazzstock_net.app.dao.dao_simulation import DataAccessObjectSimulation
from datetime import datetime


application_customize = Blueprint('customize', __name__, url_prefix='/')

@application_customize.route('/setCustomFeatureOrder', methods=['POST'])
def getSimulationResult():
    '''
    최근거래일 총 데이터건수를 가져오는 함수
    '''

    if request.method == 'POST':

        from_date = request.json.get("from_date")
        to_date = request.json.get("to_date")

        # condition_set = []
        # for i, row in enumerate(request.json.get("condition_set")):
        #     condition_set.append(row)
        # start_time = datetime.now()
        # dao = DataAccessObjectSimulation()
        # ret = dao.get_simulation_result_direct(from_date, to_date, condition_set)
        # elapsed_time = datetime.now() - start_time
        #
        #
        # return jsonify(simulation_result_table_html=ret.get('simulation_result_table_html'),
        #                simulation_result_table_json=ret.get('simulation_result_table_json'),
        #                simulation_result_column_list=ret.get('simulation_result_column_list'),
        #                elapsed_time=elapsed_time.total_seconds())

        return {}



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
