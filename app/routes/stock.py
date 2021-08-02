from flask import request, jsonify, session, Response, Blueprint
from jazzstock_net.app.dao.dao_stock import DataAccessObjectStock
from jazzstock_net.app.config.config_table_specification import spec as spec_content
from datetime import datetime
from jazzstock_net.app.config.config_message import alert_message

from io import StringIO


application_stock = Blueprint('stock', __name__, url_prefix='/')


def _getMembership():
    if session.get('loggedin') == True:
        if session.get('expiration_date') > str(datetime.now().date()):
            return {'result': True, 'membership': 'supporter'}

        else:
            return {'result': True, 'membership': 'general'}

    else:
        return {'result': True, 'membership': 'non-member'}


# 화면을 요청하는 controller
@application_stock.route('/ajaxTable', methods = ['POST'])
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





# @application_stock.route('/ajaxRealtime', methods=['POST'])
# def ajax_getRealtime():
#
#     seq = request.form['seq'].replace('"', '')
#     date = request.form['date'].replace('"', '')
#
#     dao = DataAccessObjectStock()
#     ret = dao.smar_realtime(date, seq)
#
#     return jsonify(realtime=ret)



@application_stock.route('/getTableForOhlcDay', methods=['POST'])
def getTableForOhlcDay():
    '''
    CHART데이터는 Javascript단에서 최대한 빠르게 RENDERING 할 수 있는 자료구조로 처리해서 반환한다
    빠른반복과 적은 트래픽이 오가는게 관건
    '''

    stockcode = request.form['stockcode'].replace('"', '')

    dao = DataAccessObjectStock()
    ohlc_day_data = dao.ohlcDay(stockcode)

    return jsonify(ohlc_day_data=ohlc_day_data)

@application_stock.route('/getTableForSummary', methods=['POST'])
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




@application_stock.route('/ajaxRelated', methods=['POST'])
def ajax_getSndRelated():

    chartid = request.form['chartId'].replace('"', '')
    stockcode = request.form['stockcode'].replace('"', '')

    dao = DataAccessObjectStock()
    htmltable = dao.sndRelated(stockcode, chartid)

    return htmltable


@application_stock.route('/getTableCsv', methods=['GET'])
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





@application_stock.route('/getRecentTradingDays', methods=['POST'])
def getRecentTradingDays():
    '''
    T_DATE_INDEXED에서 TOP 240 DATE를 가져오는 함수
    '''
    dao = DataAccessObjectStock()
    recent_trading_days_list = dao.recent_trading_days(limit=720, above="2020-01-01")


    return jsonify({'result': True, "content": recent_trading_days_list})




@application_stock.route('/getSpecification', methods=['POST'])
def getSpecification():
    '''
    최근거래일 총 데이터건수를 가져오는 함수
    '''

    return jsonify(spec_content)



@application_stock.route('/getLastTradingDaysLastSeq', methods=['POST'])
def getLastTradingDaysLastSeq():
    '''
    최근거래일 총 데이터건수를 가져오는 함수
    '''

    dao = DataAccessObjectStock()
    date_0, date_1, seq_max_date_0, seq_max = dao.get_last_trading_days_last_seq()
    return jsonify({'result':True,
                    'date_zero': date_0, 'date_one':date_1, 'seq_max_date_zero':seq_max_date_0, 'seq_max':seq_max})



@application_stock.route('/getRealtimeTableHTML', methods=['POST'])
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


@application_stock.route('/fetchRowsRealtime', methods=['POST'])
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