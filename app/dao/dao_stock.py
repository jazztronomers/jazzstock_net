from jazzstock_net.app.common import connector_db as db
from datetime import datetime as dt
import numpy as np
import pandas as pd

pd.options.display.max_rows = 2500

class DataAccessObjectStock:

    def sndRank(self, target, interval, order, by, method='json', limit=50, usercode=0):

        t1 = dt.now()
        date = db.selectSingleValue("SELECT DATE FROM jazzdb.T_DATE_INDEXED WHERE CNT = 0")


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
                        , "N" AS FAV
                        , MC
                        , CLOSE
                        , P1, P5, P20, P60, P120, P240
                        , I1, I5, I20, I60, I120, I240
                        , F1, F5, F20, F60, F120, F240
                        , YG1, YG5, YG20, YG60, YG120, YG240
                        , S1, S5, S20, S60, S120, S240
                    '''

        querycont = '''
                , IR, FR, PR, YR, SR, TR

                , CONCAT(DIR_L4, DIR_L3, DIR_L2, DIR_L1) AS PATTERN
                , DAYS_L4 AS L4ED 
                , DAYS_L3 AS L3ED
                , DAYS_L2 AS L2ED
                , DAYS_L1 AS L1ED
                
                , BBW_L1 AS L4BW
                , BBW_L2 AS L3BW
                , BBW_L3 AS L2BW
                , BBW_L4 AS L1BW
                
                , BBP_L1 AS L4BP
                , BBP_L2 AS L3BP
                , BBP_L3 AS L2BP
                , BBP_L4 AS L1BP

                , CASE WHEN EPSC > 0 THEN ROUND(ABS(CLOSE)/EPSC,2) ELSE -1 END AS cPER
                , CASE WHEN BPS > 0 THEN ROUND(ABS(CLOSE)/BPS,2) ELSE -1 END AS cPBR
                , ROE
                , CATEGORY
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

                            SELECT STOCKCODE, EPSC, BPS, ROE
                            FROM jazzdb.T_STOCK_FINAN E
                            WHERE 1=1
                            AND DATE = '2009'
                            AND TYPE = 'C'

                )F ON (A.STOCKCODE = F.STOCKCODE)


				LEFT JOIN (
					SELECT STOCKCODE, GROUP_CONCAT(CATEGORY) AS CATEGORY FROM jazzdb.T_STOCK_CATEGORY_ROBO GROUP BY 1
                )G ON (A.STOCKCODE = G.STOCKCODE)
                LEFT JOIN jazzdb.T_STOCK_BB I ON (A.STOCKCODE = I.STOCKCODE AND A.DATE = I.DATE)
                LEFT JOIN (
					SELECT STOCKCODE, TIMESTAMP
					FROM jazzstockuser.T_USER_STOCK_FAVORITE
                    WHERE 1=1
                    AND USERCODE = '%s'
                    AND DELYN = 0
                )  H ON (A.STOCKCODE = H.STOCKCODE)
                LEFT JOIN jazzdb.T_STOCK_MC J ON (A.STOCKCODE = J.STOCKCODE AND A.DATE = J.DATE)
                #=========================================================================
                WHERE 1=1'''%(usercode)

        queryend = '''

                AND A.DATE = "%s"
                AND ((I1 BETWEEN -10 AND 10) OR (F1 BETWEEN -10 AND 10))
                AND  J.MC > 0.62  # 2021-02-15기준 2000종목
                ORDER BY %s %s
                LIMIT %s


            ''' % (date, order, by, limit)

        fullquery = queryhead + querycont + querytail + queryend
        df = db.selectpd(fullquery)
        rtdf = df[df.columns[2:]].round(4)
        if method == 'dataframe':
            return rtdf
        elif method =='json':
            return rtdf.to_json(orient='split')


    # 수급테이블
    def sndRankHtml(self, target, interval, order, by, limit=50, usercode=0):

        t1 = dt.now()
        rtdf = self.sndRank(target, interval, order, by, method='dataframe', limit=limit, usercode=usercode)

        t2 = dt.now()
        float_columns = ['P1', 'P5', 'P20', 'P60', 'P120', 'P240',
                         'I1', 'I5', 'I20', 'I60', 'I120','I240',
                         'F1', 'F5', 'F20', 'F60', 'F120', 'F240'

            , 'YG1', 'YG5', 'YG20', 'YG60', 'YG120', 'YG240'
            , 'S1', 'S5', 'S20', 'S60', 'S120', 'S240'
                         ]


        rtdf[float_columns] = rtdf[float_columns] * 100
        rtdf[float_columns] = rtdf[float_columns].round(3)
        rtdf = rtdf.fillna(0)

        html = (
                rtdf.style
                .hide_index()
                .render()
        )

        t3 = dt.now()
        return html

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


    def finanTable(self, code):

        query = '''
        
        SELECT DATE, PER, PBR, ROE, EPSC, BPS
        FROM jazzdb.T_STOCK_FINAN A
        JOIN jazzdb.T_STOCK_CODE_MGMT B USING (STOCKCODE)
        WHERE 1=1
        AND (STOCKCODE = '%s' OR STOCKNAME = '%s')
        AND TYPE = 'C'
        ORDER BY DATE DESC
        
        '''%(code,code)

        df = db.selectpd(query)
        html = (
            df.style
                .hide_index()
                # .applymap(color_negative_red, subset=float_columns)
                .highlight_null('grey')
                .render())

        return html



    # 관련종목
    def sndRelated(self,code, chartid):

        # df = pd.read_csv('./static/pdtable.csv').round(4)


        q = '''

        SELECT CONCAT("<a href='#' onclick=\\"getChartData('", A.STOCKNAME, "','%s'); return false;\\">",CASE WHEN (A.STOCKCODE = '%s' OR STOCKNAME = '%s') THEN CONCAT('<b>','>>>',STOCKNAME,'</b>') ELSE STOCKNAME END,'</a>') AS STOCKNAME
            , ROUND(ABS(MC),1) AS MC
            , FORMAT(ABS(D.CLOSE),0) AS CLOSE

            , CASE WHEN EPSC > 0 THEN ROUND(ABS(D.CLOSE)/EPSC,2) ELSE -1 END AS cPER
            , CASE WHEN BPS > 0 THEN ROUND(ABS(D.CLOSE)/BPS,2) ELSE -1 END AS cPBR
            , E.ROE
            # , SBDD AS SBAL
            , P1, P5, P20, P60, P120, P240
            , I1, I5, I20, I60, I120, I240
            , F1, F5, F20, F60, F120, F240
            # , SRT3 AS SH3
            # , SRT5 AS SH5
            # , SBDFD1 AS SBDF1
            # , SBDFD3 AS SBDF3
            # , SBDFD5 AS SBDF5
            , BBP, BBW
        
        FROM
        (
            SELECT STOCKCODE, STOCKNAME, GROUP_CONCAT(CATEGORY) AS CATEGORY
            FROM jazzdb.T_STOCK_CODE_MGMT A
            JOIN jazzdb.T_STOCK_CATEGORY_ROBO B USING (STOCKCODE)
            WHERE 1=1
            AND CATEGORY IN (
                SELECT CATEGORY
                FROM jazzdb.T_STOCK_CODE_MGMT
                JOIN jazzdb.T_STOCK_CATEGORY_ROBO USING (STOCKCODE)
                WHERE 1=1
                AND (STOCKCODE = '%s' OR STOCKNAME = '%s')
                GROUP BY CATEGORY
            )
            AND LISTED = 1
            GROUP BY STOCKCODE, STOCKNAME
        ) A

        JOIN jazzdb.T_STOCK_SND_DAY D ON (A.STOCKCODE = D.STOCKCODE)
        JOIN jazzdb.T_DATE_INDEXED C ON (D.DATE = C.DATE)

        JOIN (

            SELECT *
            FROM jazzdb.T_STOCK_FINAN E
            WHERE 1=1
            AND DATE = '2003'
            AND TYPE = 'C'




        )E ON (A.STOCKCODE = E.STOCKCODE)
        
        JOIN jazzdb.T_STOCK_SND_ANALYSIS_RESULT_TEMP F ON (A.STOCKCODE = F.STOCKCODE AND D.DATE = F.DATE)
        JOIN jazzdb.T_STOCK_SND_ANALYSIS_LONGTERM G ON (A.STOCKCODE = G.STOCKCODE AND D.DATE = G.DATE)
        # LEFT JOIN jazzdb.T_STOCK_SHORT_ANALYSIS H ON (A.STOCKCODE = H.STOCKCODE AND D.DATE = H.DATE)
        LEFT JOIN jazzdb.T_STOCK_BB I ON (A.STOCKCODE = I.STOCKCODE AND D.DATE = I.DATE)
        LEFT JOIN jazzdb.T_STOCK_MC J ON (A.STOCKCODE = J.STOCKCODE AND D.DATE = J.DATE)

        
        WHERE 1=1
        AND CNT = 0
        ORDER BY MC DESC


        ''' %(chartid, code,code, code,code)

        df = db.selectpd(q).round(4)

        def color_negative_red(val):
            """
            Takes a scalar and returns a string with
            the css property `'color: red'` for negative
            strings, black otherwise.
            """

            if(isinstance(val, float)):


                if (val > 30): color = '#ff3300'
                elif (val > 20): color = '#ff3d0d'
                elif (val > 10): color = '#ffad99'
                elif (val > 8): color = '#ffb8a6'
                elif (val > 6): color = '#ffc2b2'
                elif (val > 4): color = '#ffccbf'
                elif (val > 2): color = '#ffd6cc'
                elif (val > 1): color = '#ffe0d9'
                elif (val > 0.5): color = '#ffebe6'
                elif (val > -0.5): color = '#ffffff'
                elif (val > -1): color = '#e6f0fa'
                elif (val > -2): color = '#d9e8f7'
                elif (val > -4): color = '#cce0f5'
                elif (val > -6): color = '#bfd9f2'
                elif (val > -8): color = '#b2d1f0'
                elif (val > -10): color = '#3385d6'
                elif (val > -20): color = '#1a75d1'
                elif (val > -30): color = '#0066cc'
                else: color = '#1a47a3'
                return 'background-color: %s' % color
            else:
                if(val==code): return 'background-color: %s' % ('#bfd9f2')

        def highlight(val):
            """
            Takes a scalar and returns a string with
            the css property `'color: red'` for negative
            strings, black otherwise.
            """

            if(val==code): return 'background-color: %s' % ('#bfd9f2')



        float_columns = df.select_dtypes(include=[np.float64]).columns
        df[float_columns[4:]] = df[float_columns[4:]] * 100

        # print(df.columns)

        html = (
                df.style
                .hide_index()
                .applymap(color_negative_red, subset=df.columns[7:])
                .highlight_null('grey')
                .render()
        )


        return html



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
            print(df)
            return {'result': [x for x in df.to_dict("index").values()]}

        else:

            return {'result': 'Market closed'}