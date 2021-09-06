from jazzstock_net.app.common import connector_db as db
from datetime import datetime as dt
from jazzstock_net.app.config.config_others import PATH_ROOT
import pandas as pd
import pickle
import os
from jazzstock_net.app.config.config_table_specification import spec_list_float_column
from jazzstock_net.app.config.config_table_specification import spec_dict_all_column

pd.options.display.max_rows = 2500


quarter = '2106'

class DataAccessObjectStock:

    def sndRank(self, targets=['P','I','F','YG','S'], intervals=[1,5,20,60,120,240], orderby='I1', orderhow='DESC', method='json', limit=50, usercode=0, fav_only=False, report_only=False, date_idx=None, debug=False):

        t1 = dt.now()

        if date_idx == None:
            date = db.selectSingleValue("SELECT DATE FROM jazzdb.T_DATE_INDEXED WHERE CNT = 0")
            date_240 = db.selectSingleValue("SELECT DATE FROM jazzdb.T_DATE_INDEXED WHERE CNT = 240")

        else:
            date = db.selectSingleValue("SELECT DATE FROM jazzdb.T_DATE_INDEXED WHERE CNT = %s"%(date_idx))
            date_240 = db.selectSingleValue("SELECT DATE FROM jazzdb.T_DATE_INDEXED WHERE CNT = %s" % (int(date_idx) + 240))



        '''
        IFNULL(P1,  'null') AS 
        IFNULL(P5,  'null') AS 
        IFNULL(P20, 'null') AS 
        IFNULL(P60, 'null') AS 
        IFNULL(P120, 'null') AS 
        IFNULL(P240, 'null') AS
         
        IFNULL(I1,  'null') AS 
        IFNULL(I5,  'null') AS 
        IFNULL(I20, 'null') AS 
        IFNULL(I60, 'null') AS 
        IFNULL(F1,  'null') AS 
        IFNULL(F5,  'null') AS 
        IFNULL(F20, 'null') AS 
        IFNULL(F60, 'null') AS 
        '''

        queryhead = '''

                    SELECT CASE WHEN B.MARKET = '0' THEN '' ELSE '*' END AS MARKET
                        , A.DATE
                        , CONCAT(B.STOCKCODE, '_', B.STOCKNAME) AS  STOCKNAME
                        , B.STOCKCODE AS FAV
                        , MC
                        , CLOSE
                        
                    '''


        querytarget =  ''
        for target in targets:
            for interval in intervals:
                querytarget = querytarget + ', IFNULL(%s%s, 0) AS %s%s'%(target, interval, target, interval)
            querytarget = querytarget + '\n'

        queryrank = ''
        for target in targets[1:]:
            queryrank = queryrank + ', %s%s'%(target.replace("YG", "Y").replace("PS","P"), 'R')
        queryrank = queryrank + '\n'
        querycont = '''
        
        
                , PSMAR5 AS PMA5
                , PSMAR20 AS PMA20
                , PSMAR60 AS PMA60
                , VSMAR5 AS VMA5
                , VSMAR20 AS VMA20
                , VSMAR60 AS VMA60
                , BBP
                , BBW
                
                , CASE WHEN EPSC > 0 THEN ROUND(ABS(CLOSE)/EPSC,2) ELSE -1 END AS PER
                , CASE WHEN BPS > 0 THEN ROUND(ABS(CLOSE)/BPS,2) ELSE -1 END AS PBR
                , EPS_Y
                , EPS_Q
                , BPS_Y
                , BPS_Q
                , ROE
                , M.CIRCRATE AS CCR
                
                , CATEGORY
                # , TITLE AS RTITLE, RDATE, RC1M, RC2M

                , TITLE AS RTITLE, RC1Y
                , CONCAT(L4BE, L3BE, L2BE, L1BE) AS PATTERN
                , L4ED 
                , L3ED
                , L2ED
                , L1ED
                
                , L4BW
                , L3BW
                , L2BW
                , L1BW
                
                , L4BP
                , L3BP
                , L2BP
                , L1BP
                
            
                # , CONCAT("<a href='/downloadReport/",ETC,"'>",TITLE,"</a>") AS RTITLE, RDATE, RCNT1M, RCNT2M
                
                , LEFT(IFNULL(H.TIMESTAMP, '1970-01-01'), 10) AS FAV_DATE

            '''
        # ======================================================
        querytail = '''

                FROM jazzdb.T_STOCK_SND_ANALYSIS_RESULT_TEMP A
                JOIN jazzdb.T_STOCK_CODE_MGMT B USING (STOCKCODE)
                LEFT JOIN jazzdb.T_STOCK_SND_ANALYSIS_LONGTERM D USING (STOCKCODE,DATE)
                LEFT JOIN jazzdb.T_STOCK_BB_EVENT E ON (A.STOCKCODE = E.STOCKCODE AND A.DATE = E.DATE)
                #=========================================================================
                
                LEFT JOIN (

                            SELECT STOCKCODE, EPSC_YOY AS EPS_Y, EPSC_QOQ AS EPS_Q, BPS_YOY AS BPS_Y, BPS_QOQ AS BPS_Q
                            FROM jazzdb.T_STOCK_FINAN_XOX
                            WHERE 1=1
                            AND QUARTER = '%s'

                )C ON (A.STOCKCODE = C.STOCKCODE)
                LEFT JOIN (

                            SELECT STOCKCODE, EPSC, BPS, ROE
                            FROM jazzdb.T_STOCK_FINAN E
                            WHERE 1=1
                            AND QUARTER = '%s'
                            AND TYPE = 'C'

                )F ON (A.STOCKCODE = F.STOCKCODE)


				LEFT JOIN (
					SELECT STOCKCODE, GROUP_CONCAT(CATEGORY) AS CATEGORY FROM jazzdb.T_STOCK_CATEGORY_ROBO GROUP BY 1
                )G ON (A.STOCKCODE = G.STOCKCODE)
                LEFT JOIN jazzdb.T_STOCK_BB I ON (A.STOCKCODE = I.STOCKCODE AND A.DATE = I.DATE)
                LEFT JOIN (
					SELECT STOCKCODE, TIMESTAMP, USERCODE
					FROM jazzstockuser.T_USER_STOCK_FAVORITE
                    WHERE 1=1
                    AND USERCODE = '%s'
                    AND DELYN = 0
                )  H ON (A.STOCKCODE = H.STOCKCODE)
                LEFT JOIN jazzdb.T_STOCK_MC J ON (A.STOCKCODE = J.STOCKCODE AND A.DATE = J.DATE)
                LEFT JOIN jazzdb.T_STOCK_DAY_SMAR K ON (A.STOCKCODE = K.STOCKCODE AND A.DATE = K.DATE)
                LEFT JOIN (
                
                    SELECT STOCKCODE, MAX(RDATE) AS RDATE, GROUP_CONCAT(CONTENT separator '*#*') AS TITLE, COUNT(*) AS RC1Y
                    FROM
                    (
                        SELECT STOCKCODE, CAST(DATE AS CHAR) AS RDATE, CONCAT_wS(" | ", DATE, CONTENT, AUTHOR) AS CONTENT,
                            ROW_NUMBER() OVER (PARTITION BY STOCKCODE ORDER BY DATE DESC) AS RN
                        FROM jazzdb.T_STOCK_TEXT
                        WHERE DATE > "%s"
                    ) A
                    WHERE 1=1
                    AND RN < 10
                    GROUP BY STOCKCODE
                    
                ) L ON (A.STOCKCODE = L.STOCKCODE)

                
                LEFT JOIN jazzdb.T_STOCK_SHARES_CIRCRATE M ON (A.STOCKCODE = M.STOCKCODE AND A.DATE = M.DATE)
                #=========================================================================
                WHERE 1=1'''%(quarter, quarter, usercode, date_240)



        if fav_only:
            queryend = '''

                                AND A.DATE = "%s"
                                AND H.USERCODE = '%s'
                                AND ((I1 BETWEEN -10 AND 10) OR (F1 BETWEEN -10 AND 10))
                                AND  J.MC > 0.50  # 2021-02-15기준 2000종목
                                ORDER BY %s %s
                                LIMIT %s


                            ''' % (date, usercode, orderby, orderhow, limit)

        elif report_only:
            queryend = '''

                                AND A.DATE = "%s"
                                AND ((I1 BETWEEN -10 AND 10) OR (F1 BETWEEN -10 AND 10))
                                AND  J.MC > 0.62  # 2021-02-15기준 2000종목
                                ORDER BY RDATE DESC, %s %s
                                LIMIT %s


                            ''' % (date, orderby, orderhow, limit)

        else:

            queryend = '''
    
                    AND A.DATE = "%s"
                    AND ((I1 BETWEEN -10 AND 10) OR (F1 BETWEEN -10 AND 10))
                    AND  J.MC > 0.62  # 2021-02-15기준 2000종목
                    ORDER BY %s %s
                    LIMIT %s
    
    
                ''' % (date, orderby, orderhow, limit)

        fullquery = queryhead + querytarget + queryrank + querycont + querytail + queryend


        if debug:
            print(fullquery)

        start = dt.now()
        df = db.selectpd(fullquery)

        rtdf = df[df.columns[2:]].round(4)
        if method == 'dataframe':
            return rtdf
        elif method =='json':
            return rtdf.to_json(orient='split')


    # 수급테이블
    def sndRankHtml(self, targets=['P','I','F','YG','S'],
                    intervals=[1,5,20,60,120,240],
                    orderby='I1',
                    orderhow='DESC',
                    method='dataframe',
                    limit=50,
                    usercode=0,
                    fav_only=False,
                    report_only=False,
                    date_idx=0,
                    feature_group_order=None):
        rtdf = self.sndRank(targets, intervals, orderby, orderhow, method=method, limit=limit, usercode=usercode, fav_only=fav_only, date_idx=date_idx, report_only=report_only)
        float_columns = []

        for target in targets:
            for interval in intervals:
                float_columns.append('%s%s'%(target,interval))


        # PERCENT COLUMNS 처리
        for column in rtdf.columns.tolist():
            if column in spec_list_float_column:
                float_columns.append(column)


        rtdf[float_columns] = rtdf[float_columns] * 100
        rtdf[float_columns] = rtdf[float_columns].round(3)
        rtdf = rtdf.fillna(0)

        column_reorder_ref, column_reorder = [], []

        if feature_group_order:
            for each_group in feature_group_order:
                column_reorder_ref = column_reorder_ref + spec_dict_all_column[each_group]

            for col in column_reorder_ref:
                if col in rtdf.columns:
                    column_reorder.append(col)

            rtdf = rtdf[column_reorder]





        if orderhow == 'ASC':
            rtdf.sort_values(by=orderby, ascending=True)

        html = (
                rtdf.style
                .hide_index()
                .render()
        )

        return html, rtdf.columns.values.tolist()




    # 수급차트
    def sndChart(self, code):

        query = '''
                            SELECT A.STOCKCODE, A.STOCKNAME
                               , CAST(A.DATE AS char) AS DATE, B.ADJRATIO 
                               , CNT
                               , FORMAT(ABS(B.CLOSE),0) AS FMTCLOSE
                               , B.OPEN, B.HIGH, B.LOW, B.CLOSE
                               , C.VOLUME
                               , C.FOREI
                               , C.INS, C.PER, C.YG, C.SAMO, C.TUSIN, C.FINAN, C.BANK
                               , C.NATION, C.INSUR, C.OTHERCORPOR, C.OTHERFOR, C.OTHERFINAN
                               , IFNULL(MG,0) 'MG' 
                               , IFNULL(GM,0) 'GM'
                               , IFNULL(CS,0) 'CS'
                               , IFNULL(MR,0) 'MR'
                               , IFNULL(MQ,0) 'MQ'
                               , IFNULL(CL,0) 'CL'
                               , IFNULL(UB,0) 'UB'
                               , IFNULL(NM,0) 'NM'
                               , IFNULL(DC,0) 'DC'
                               , IFNULL(DW,0) 'DW'
                               , IFNULL(JP,0) 'JP'
                               , IFNULL(CT,0) 'CT'
                               , IFNULL(SY,0) 'SY'
                               , IFNULL(HT,0) 'HT'

                            FROM
                            (
                               SELECT A.STOCKNAME, A.STOCKCODE, DIX.DATE, DIX.CNT
                               FROM jazzdb.T_STOCK_CODE_MGMT A

                               JOIN (

                                 SELECT DATE, CNT   
                                  FROM jazzdb.T_DATE_INDEXED
                                 WHERE CNT BETWEEN 0 AND 500

                               ) DIX 

                               WHERE 1=1
                               AND (STOCKCODE = '%s' OR STOCKNAME = '%s')
                            ) A


                            JOIN (
                               SELECT STOCKCODE, DATE, OPEN, HIGH, LOW, CLOSE, ADJCLASS, ADJRATIO
                               FROM jazzdb.T_STOCK_OHLC_DAY
                            ) B ON (A.STOCKCODE = B.STOCKCODE AND A.DATE = B.DATE )


                            JOIN (
                               SELECT STOCKCODE, DATE, VOLUME
                               , FOREI, INS, PER, YG, SAMO, TUSIN, FINAN, BANK, INSUR, NATION, OTHERCORPOR, OTHERFOR, OTHERFINAN
                               FROM jazzdb.T_STOCK_SND_DAY
                            ) C ON (A.STOCKCODE = C.STOCKCODE AND A.DATE = C.DATE )

                            LEFT JOIN (
                               SELECT STOCKCODE, DATE, MG, GM, CS, MR, MQ, CL, UB, NM, DC, DW, JP, CT, SY, HT
                               FROM jazzdb.T_STOCK_SND_WINDOW_MERGED
                            ) D ON (A.STOCKCODE = D.STOCKCODE AND A.DATE = D.DATE )
                            


        ''' % (code, code)


        df = db.selectpd(query)
        ret = {'result': [x for x in df.to_dict("index").values()]}

        '''
        {'result': [
            {'STOCKCODE': '241840', 'DATE': '2020-12-24', 'ADJRATIO': -1, 'CNT': 3, 'FMTCLOSE': '29,300', 'OPEN': 25550,
             'HIGH': 31900, 'LOW': 25550, 'CLOSE': 29300, 'VOLUME': 2767022, 'FOREI': -81951, 'INS': 143783,
             'PER': -62641, 'YG': 18973, 'SAMO': 79156, 'TUSIN': 48288, 'FINAN': -2031, 'BANK': 0, 'NATION': 0,
             'INSUR': -603, 'OTHERCORPOR': 293, 'OTHERFOR': 516, 'OTHERFINAN': 0, 'MG': 0, 'GM': 0, 'CS': 0, 'MR': 0,
             'MQ': 0, 'CL': 0, 'UB': 0, 'NM': 0, 'DC': 0, 'DW': 0, 'JP': 0, 'CT': 0, 'SY': 0, 'HT': 0},
            {'STOCKCODE': '241840', 'DATE': '2020-12-28', 'ADJRATIO': -1, 'CNT': 2, 'FMTCLOSE': '31,950', 'OPEN': 29000,
             'HIGH': 34650, 'LOW': 29000, 'CLOSE': 31950, 'VOLUME': 1698314, 'FOREI': 69919, 'INS': -2374,
             'PER': -62847, 'YG': 7988, 'SAMO': 272, 'TUSIN': -10082, 'FINAN': 398, 'BANK': 0, 'NATION': 0,
             'INSUR': -2050, 'OTHERCORPOR': -5314, 'OTHERFOR': 616, 'OTHERFINAN': 1100, 'MG': 0, 'GM': 0, 'CS': 0,
             'MR': 0, 'MQ': 0, 'CL': 0, 'UB': 0, 'NM': 0, 'DC': 0, 'DW': 0, 'JP': 0, 'CT': 0, 'SY': 0, 'HT': 0}}
        '''

        return ret


    def ohlcDay(self, code):
        query = '''
                                    SELECT A.STOCKCODE, A.STOCKNAME
                                       , CAST(A.DATE AS char) AS DATE
                                       , CNT
                                       , B.OPEN, B.HIGH, B.LOW, B.CLOSE, C.VOLUME
                                       , D.MA5 AS MA_W
                                       , D.MA20 AS MA_M 
                                       , D.MA60 AS MA_Q
                                       , D.MA120 AS MA_HY
                                       

                                    FROM
                                    (
                                       SELECT A.STOCKNAME, A.STOCKCODE, DIX.DATE, DIX.CNT
                                       FROM jazzdb.T_STOCK_CODE_MGMT A

                                       JOIN (

                                         SELECT DATE, CNT   
                                          FROM jazzdb.T_DATE_INDEXED
                                         WHERE CNT BETWEEN 0 AND 600

                                       ) DIX 

                                       WHERE 1=1
                                       AND (STOCKCODE = '%s' OR STOCKNAME = '%s')
                                    ) A


                                    JOIN (
                                       SELECT STOCKCODE, DATE, OPEN, HIGH, LOW, CLOSE, ADJCLASS, ADJRATIO
                                       FROM jazzdb.T_STOCK_OHLC_DAY
                                    ) B ON (A.STOCKCODE = B.STOCKCODE AND A.DATE = B.DATE )
                                    
                                    JOIN (
                                       SELECT STOCKCODE, DATE, VOLUME
                                       FROM jazzdb.T_STOCK_SND_DAY
                                    ) C ON (A.STOCKCODE = C.STOCKCODE AND A.DATE = C.DATE )
                                    
                                    
                                    
                                    JOIN (
                                       SELECT STOCKCODE, DATE, MA5, MA20, MA60, MA120
                                       FROM jazzdb.T_STOCK_MA
                                    ) D ON (A.STOCKCODE = D.STOCKCODE AND A.DATE = D.DATE )





                ''' % (code, code)

        df = db.selectpd(query)
        ret = {'result': df.to_dict("list")}


        '''
        {'result': [
        {'STOCKCODE': '213090', 'STOCKNAME': '미래테크놀로지', 'DATE': '2021-07-02', 'CNT': 0, 'OPEN': 12600, 'HIGH': 12650, 'LOW': 12350, 'CLOSE': 12450}, 
        {'STOCKCODE': '213090', 'STOCKNAME': '미래테크놀로지', 'DATE': '2021-07-01', 'CNT': 1, 'OPEN': 12750, 'HIGH': 12750, 'LOW': 12500, 'CLOSE': 12600}, 
        {'STOCKCODE': '213090', 'STOCKNAME': '미래테크놀로지', 'DATE': '2021-06-30', 'CNT': 2, 'OPEN': 12950, 'HIGH': 13050, 'LOW': 12550, 'CLOSE': 12800}, 
        {'STOCKCODE': '213090', 'STOCKNAME': '미래테크놀로지', 'DATE': '2021-06-29', 'CNT': 3, 'OPEN': 14650, 'HIGH': 14650, 'LOW': 12950, 'CLOSE': 12950}
        ]
        '''

        return ret

    def sndDay(self, code):

        query = '''
                            SELECT A.STOCKCODE, A.STOCKNAME
                               , CAST(A.DATE AS char) AS DATE
                               , C.FOREI
                               , C.INS, C.PER, C.YG, C.SAMO, C.TUSIN, C.FINAN, C.BANK
                               , C.NATION, C.INSUR, C.OTHERCORPOR, C.OTHERFOR, C.OTHERFINAN
                               , IFNULL(MG,0) 'MG' 
                               , IFNULL(GM,0) 'GM'
                               , IFNULL(CS,0) 'CS'
                               , IFNULL(MR,0) 'MR'
                               , IFNULL(MQ,0) 'MQ'
                               , IFNULL(CL,0) 'CL'
                               , IFNULL(UB,0) 'UB'
                               , IFNULL(NM,0) 'NM'
                               , IFNULL(DC,0) 'DC'
                               , IFNULL(DW,0) 'DW'
                               , IFNULL(JP,0) 'JP'
                               , IFNULL(CT,0) 'CT'
                               , IFNULL(SY,0) 'SY'
                               , IFNULL(HT,0) 'HT'

                            FROM
                            (
                               SELECT A.STOCKNAME, A.STOCKCODE, DIX.DATE, DIX.CNT
                               FROM jazzdb.T_STOCK_CODE_MGMT A

                               JOIN (

                                 SELECT DATE, CNT   
                                  FROM jazzdb.T_DATE_INDEXED
                                 WHERE CNT BETWEEN 0 AND 601

                               ) DIX 

                               WHERE 1=1
                               AND (STOCKCODE = '%s' OR STOCKNAME = '%s')
                            ) A

                            JOIN (
                               SELECT STOCKCODE, DATE, VOLUME
                               , FOREI, INS, PER, YG, SAMO, TUSIN, FINAN, BANK, INSUR, NATION, OTHERCORPOR, OTHERFOR, OTHERFINAN
                               FROM jazzdb.T_STOCK_SND_DAY
                            ) C ON (A.STOCKCODE = C.STOCKCODE AND A.DATE = C.DATE )

                            LEFT JOIN (
                               SELECT STOCKCODE, DATE, MG, GM, CS, MR, MQ, CL, UB, NM, DC, DW, JP, CT, SY, HT
                               FROM jazzdb.T_STOCK_SND_WINDOW_MERGED
                            ) D ON (A.STOCKCODE = D.STOCKCODE AND A.DATE = D.DATE )



        ''' % (code, code)

        df = db.selectpd(query)
        ret = {'result': df.to_dict("list")}


        return ret

    def finanTable(self, code):

        query = '''
        
        SELECT QUARTER, PER, PBR, ROE, EPSC, BPS, NPR, OPR
        FROM jazzdb.T_STOCK_FINAN A
        JOIN jazzdb.T_STOCK_CODE_MGMT B USING (STOCKCODE)
        WHERE 1=1
        AND (STOCKCODE = '%s' OR STOCKNAME = '%s')
        AND TYPE = 'C'
        ORDER BY QUARTER ASC
        
        '''%(code,code)

        df = db.selectpd(query)

        # df.index = df.DATE
        # df = df[['PER', 'PBR', 'ROE', 'NPR', 'OPR']]
        # df = df.transpose()
        column_list= df.columns.tolist()
        html = (
            df.style
                .highlight_null('grey')
                .render())



        return df.to_dict("list"), html, column_list

    def get_reports(self, stockcode):

        query = '''

        SELECT CAST(DATE AS CHAR) AS DATE, AUTHOR, CONTENT
        FROM jazzdb.T_STOCK_TEXT
        JOIN jazzdb.T_STOCK_CODE_MGMT B USING (STOCKCODE)
        WHERE 1=1
        AND (STOCKCODE = '%s' OR STOCKNAME = '%s')
        ORDER BY DATE DESC
    
        ''' % (stockcode, stockcode)

        df = db.selectpd(query)
        return df.to_dict("list")



    def smar_realtime(self, date, seq):

        # check current date YN
        # if(str(dt.now().date()) == date):
        if True:

            query = '''
            SELECT STOCKCODE, TIME, VSMAR20, PSMAR20, TIMESTAMP, SEQ
            FROM
            (
                SELECT STOCKCODE, 
                        CAST(TIME AS CHAR) AS TIME, 
                        ROW_NUMBER() OVER (PARTITION BY STOCKCODE, DATE, TIME ORDER BY TIMESTAMP DESC) AS RN,
                        VSMAR20, 
                        PSMAR20, 
                        CAST(TIMESTAMP AS CHAR) AS TIMESTAMP,
                        SEQ
                FROM jazzdb.T_STOCK_MIN_05_SMAR_REALTIME 
                WHERE 1=1
                AND DATE = '%s'
                AND SEQ > %s
                AND TIMESTAMP > 0
            ) A
            WHERE 1=1
            # AND STOCKCODE = '297890'
            AND RN = 1
            ORDER BY SEQ
            '''%(date, seq)



            df = db.selectpd(query)

            return {'result': [x for x in df.to_dict("index").values()]}

        else:

            return {'result': 'Market closed'}


    def recent_trading_days(self, limit=10, above=None):

        query = '''
        
        SELECT CAST(DATE AS CHAR) AS DATE, QUARTER
        FROM jazzdb.T_DATE_INDEXED
        JOIN jazzdb.T_DATE_FINAN USING(DATE) 
        WHERE CNT < %s ORDER BY CNT ASC
        
        
        '''%(limit)


        df_trading_days = db.selectpd(query)
        if above is not None:
            recent_trading_days = [x for x in df_trading_days.DATE.values.tolist() if x >= above]

        quarter = df_trading_days.QUARTER.head(1).values[0]

        return {'recent_trading_days': recent_trading_days, 'quarter_current':quarter}

    # ==================================================================================
    # 여 기 서 부 터 실 시 간 테 이 블 용 !
    # ==================================================================================

    def get_last_trading_days_last_seq(self):


        date_0, date_1 = self.recent_trading_days(limit=2)

        query = '''
        SELECT MAX(SEQ) 
        FROM jazzdb.T_STOCK_MIN_05_SMAR_REALTIME 
        WHERE 1=1
        AND DATE = '%s' 
        '''%(date_0)

        seq_max_date_0 = db.selectSingleValue(query)



        query = '''
        SELECT MAX(SEQ) 
        FROM jazzdb.T_STOCK_MIN_05_SMAR_REALTIME 
        '''

        seq_max = db.selectSingleValue(query)


        return date_0, date_1, seq_max_date_0, seq_max




    def realtime_table_html(self, the_date='2021-03-19', limit=200):

        print(' * realtime_table_html', limit)
        stocks = self._getRealtimeStocks(the_date, limit=limit)
        timecolumns = [ \
            '0900', '0905', '0910', '0915', '0920', '0925', '0930', '0935', '0940', '0945', '0950', '0955',
            '1000', '1005', '1010', '1015', '1020', '1025', '1030', '1035', '1040', '1045', '1050', '1055',
            '1100', '1105', '1110', '1115', '1120', '1125', '1130', '1135', '1140', '1145', '1150', '1155',
            '1200', '1205', '1210', '1215', '1220', '1225', '1230', '1235', '1240', '1245', '1250', '1255',
            '1300', '1305', '1310', '1315', '1320', '1325', '1330', '1335', '1340', '1345', '1350', '1355',
            '1400', '1405', '1410', '1415', '1420', '1425', '1430', '1435', '1440', '1445', '1450', '1455',
            '1500', '1505', '1510', '1515', '1530']



        rows = []

        for i in range(len(stocks.values())):
            row = [['%s_%s'%(stockcode, stockname) for stockcode, stockname in stocks.items()][i]] + [0] * len(timecolumns)
            rows.append(row)

        df_data = pd.DataFrame(columns=['STOCKNAME'] + timecolumns, data=rows)

        feature_columns = ['MC', 'I5', 'F5', 'PRV_CLSE', 'RP', 'D_PMA5', 'D_VMA5', 'D_PMA60', 'D_VMA60']
        query = '''

                    SELECT 
                    
                    CONCAT(E.STOCKCODE, '_', E.STOCKNAME) AS STOCKNAME,
                    MC, 
                    C.CLOSE AS PCLSE, 
                    C.CLOSE AS RCLSE,
                     
                    0 AS P0,
                    0 AS TV,
                    
                    P5,
                    I5, 
                    F5, 
                    
                    PSMAR5 AS PMA5, 
                    PSMAR60 AS PMA60, 
                    VSMAR5 AS VMA5, 
                    VSMAR60 AS VMA60  # 13
                    
                    FROM jazzdb.T_STOCK_SND_ANALYSIS_RESULT_TEMP A
                    JOIN jazzdb.T_STOCK_CODE_MGMT E USING (STOCKCODE)
                    JOIN jazzdb.T_STOCK_MC B USING (STOCKCODE, DATE)
                    JOIN jazzdb.T_STOCK_OHLC_DAY C USING (STOCKCODE, DATE)
                    JOIN jazzdb.T_STOCK_DAY_SMAR D USING (STOCKCODE, DATE) 
                    WHERE 1=1
                    AND DATE = '%s'
                    AND STOCKCODE IN %s 
                    ''' % (the_date, tuple(list(stocks.keys())))
        df_meta = db.selectpd(query)

        float_column = ['P5', 'I5', 'F5']
        df_meta[float_column] = df_meta[float_column] * 100


        df = pd.merge(df_meta, df_data, on="STOCKNAME")


        html = (
            df.style
                .hide_index()
                .render()
        )


        return {"html":html,
                "column_list":df.columns.values.tolist(),
                "stockcodes":list(stocks.keys()),
                "stocknames":list(stocks.values()),
                "df":df}



    def fetch(self, the_date='2021-03-19', seq=0):

        print(' * fetch', the_date, seq)

        query = '''

            SELECT *
            FROM
            (
                SELECT STOCKCODE, 
                STOCKNAME, 
                LEFT(REPLACE(CAST(TIME AS CHAR), ':',''),4) AS TIME, 

                VSMAR5, 
                PSMAR5,
                VSMAR20, 
                PSMAR20,
                SEQ,
                CLOSE,
                TRADINGVALUE,  
                ROW_NUMBER() OVER (PARTITION BY STOCKCODE, TIME ORDER BY SEQ DESC) AS RN 
                FROM jazzdb.T_STOCK_MIN_05_SMAR_REALTIME
                JOIN jazzdb.T_STOCK_CODE_MGMT USING (STOCKCODE)
                WHERE 1=1
                AND DATE = '%s'
                AND SEQ > %s
            ) A
            WHERE 1=1
            AND RN = 1
            ORDER BY TIME ASC, SEQ ASC

            ''' % (the_date, seq)


        df = db.selectpd(query).round(3)
        _times = df.TIME.drop_duplicates()

        if len(df)>0:
            seq_max = int(df.SEQ.max())
        else:
            seq_max = seq

        ret = []
        for _time in _times:
            ret.append({'time':_time, 'stocks':df[df.TIME == _time][['STOCKCODE','STOCKNAME','VSMAR5','PSMAR5','VSMAR20','PSMAR20', 'CLOSE', 'TRADINGVALUE']].to_dict(orient='records')})

        return {'data':ret,'seq_max':seq_max}




        ## return html, df_pivoted.columns.values.tolist(), df, list(stocks.keys())



    def _getRealtimeStocks(self, the_date='2021-03-19', init=False, limit=200):
        print(' * _getRealtimeStocks', limit)
        stockcodes_pickle_path = os.path.join(PATH_ROOT, 'app/static/realtime/%s_%s.pkl'%(the_date, limit))
        if os.path.isfile(stockcodes_pickle_path):
            stocks_dic = pickle.load(open(stockcodes_pickle_path, 'rb'))

        else:
            query = '''
            SELECT STOCKCODE, STOCKNAME
            FROM
            (
                SELECT STOCKCODE, 
                        CASE WHEN RN <= 200 THEN "A"
                             WHEN RN <= 400 THEN "B"
                             WHEN RN <= 600 THEN "C"
                             WHEN RN <= 800 THEN "D"
                             WHEN RN <= 1000 THEN "E"
                             WHEN RN <= 1200 THEN "F"
                             WHEN RN <= 1400 THEN "G"
                             ELSE "H" END AS GRP
                FROM
                (
                    SELECT STOCKCODE, 
                        ROW_NUMBER() OVER (PARTITION BY DATE ORDER BY I5+F5 DESC) AS RN
                    FROM jazzdb.T_STOCK_SND_ANALYSIS_RESULT_TEMP
                    JOIN jazzdb.T_STOCK_MC USING (STOCKCODE, DATE)
                    WHERE 1=1
                    AND MC > 1          # 1300종목
                    AND DATE = '%s'
                ) A
            ) B        
            JOIN jazzdb.T_STOCK_CODE_MGMT USING (STOCKCODE)
            WHERE 1=1
            AND GRP IN ("A", "B")
            LIMIT %s
            ''' %(the_date, limit)

            stocks = db.selectpd(query)
            stocks_dic = {stockcode:stockname for stockcode, stockname in stocks.values}
            pickle.dump(stocks_dic, open(stockcodes_pickle_path, 'wb'))

        return stocks_dic



if __name__ == '__main__':


    the_date = '2021-03-26'
    dao = DataAccessObjectStock()
    ret = dao.realtime_table_html(the_date=the_date)

    df_a = ret['df']
    stockcodes = ret['stockcodes']






    # dao.fetch(list(stocks_dic.keys()))