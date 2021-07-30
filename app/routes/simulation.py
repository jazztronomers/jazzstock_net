from flask import request, jsonify, session, Blueprint
from jazzstock_net.app.dao.dao_simulation import DataAccessObjectSimulation
from datetime import datetime


application_simulation = Blueprint('simulation', __name__, url_prefix='/')

@application_simulation.route('/getSimulationResult', methods=['POST'])
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

@application_simulation.route('/saveConditionSetToServer', methods=['POST'])
def saveConditionSetToServer():
    '''
    최근거래일 총 데이터건수를 가져오는 함수
    '''

    if request.method == 'POST':

        dao = DataAccessObjectSimulation()
        ret = dao.set_simulation_conditions(request.json, session.get('usercode'))
        print(request.json)
        return jsonify({"yo": "yo"})

        #
        # html, column_list = dao.set_simulation_features(features_rows, features_name, session.get('usercode'))
        # return jsonify(simulation_result_table_html=html, simulation_result_column_list=column_list)



@application_simulation.route('/getConditionSetsFromServer', methods=['POST'])
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


@application_simulation.route('/deleteConditionSetOnServer', methods=['POST'])
def deleteConditionSetOnServer():
    '''
    최근거래일 총 데이터건수를 가져오는 함수
    '''



    if request.method == 'POST':
        print(request.json)
        condition_set_id = request.json.get("condition_set_id")
        dao = DataAccessObjectSimulation()
        ret = dao.delete_simulation_condition(usercode=session.get('usercode'), condition_set_id=condition_set_id)

        return jsonify(ret)

        #
        # html, column_list = dao.set_simulation_features(features_rows, features_name, session.get('usercode'))
        # return jsonify(simulation_result_table_html=html, simulation_result_column_list=column_list)