import mysql.connector as mc
import constant as cs
import pandas as pd
import numpy as np
import os
from datetime import datetime as dt
from dao import dbConnector as db

class Database:


    ip = cs.ip
    id = cs.id
    pw = cs.pw
    dbScheme = cs.dbScheme
    cnxn = ''

    def getConn(self):

        self.cnxn = mc.connect(host=self.ip, database=self.dbScheme, user=self.id, password=self.pw)

    def closeConn(self):

        self.cnxn.close()


    # 수급테이블
    def sndRank(self, target, interval, order, by, chartid):

        s = dt.now()

        queryhead = '''

                SELECT CASE WHEN B.MARKET = '0' THEN '' ELSE '*' END AS MARKET
                    , A.DATE
                    , CONCAT("<a href='#' onclick=\\"getChartData('", B.STOCKNAME, "','%s'); return false;\\">",B.STOCKNAME,'</a>') AS STOCKNAME     
                    , FORMAT(MC,1) AS MC
                    , FORMAT(ABS(CLOSE),0) AS CLOSE,
                '''%(chartid)

        toselect = ['P']

        for each in target:
            toselect.append(each)

        querycont = ''
        for eachcolumn in toselect:
            for eachinterval in interval:
                querycont = querycont + str(eachcolumn) + str(eachinterval) + ', '


        rankdic = {

            'I':'I',
            'F':'F',
            'YG':'Y',
            'S':'S',
            'OC':'OC',
            
            'FN':'FN',
            'T':'T',
            'PS': 'P',
            'IS': 'IS',
            'BK': 'BK'
        }



        querycont = querycont + rankdic[target[0]] + 'R'

        # order = order.replace('Y','YG')
        # order = order.replace('O', 'OC')
        # order = order.replace('I', 'YG')

        #======================================================
        querycont = querycont +'''
            # , SRT3 AS SH3
            # , SBDD AS SBAL
            # , SBDFD1 AS SBDF
            , BBP, BBW
            , CASE WHEN EPSC > 0 THEN ROUND(ABS(CLOSE)/EPSC,2) ELSE -1 END AS cPER
            , CASE WHEN BPS > 0 THEN ROUND(ABS(CLOSE)/BPS,2) ELSE -1 END AS cPBR
            , ROE
            
            
        
        '''
        #======================================================
        querytail = '''

            FROM jazzdb.T_STOCK_SND_ANALYSIS_RESULT_TEMP A
            JOIN jazzdb.T_STOCK_CODE_MGMT B USING (STOCKCODE)
            JOIN jazzdb.T_DATE_INDEXED C USING (DATE)
            LEFT JOIN jazzdb.T_STOCK_SND_ANALYSIS_LONGTERM D USING (STOCKCODE,DATE)
            #=========================================================================
            # LEFT JOIN jazzdb.T_STOCK_SHORT_ANALYSIS E USING (STOCKCODE, DATE)
            LEFT JOIN (

                        SELECT STOCKCODE, EPSC, BPS, ROE
                        FROM jazzdb.T_STOCK_FINAN E
                        WHERE 1=1
                        AND DATE = '2003'
                        AND TYPE = 'C'

            )F ON (A.STOCKCODE = F.STOCKCODE)
            
            LEFT JOIN jazzdb.T_STOCK_BB I ON (A.STOCKCODE = I.STOCKCODE AND A.DATE = I.DATE)
            LEFT JOIN jazzdb.T_STOCK_MC J ON (A.STOCKCODE = J.STOCKCODE AND A.DATE = J.DATE)
            #=========================================================================
            WHERE 1=1'''





        queryend = '''
            
            AND (I1>0 OR F1>0) 
            AND C.CNT = 0
            AND ((I1 BETWEEN -10 AND 10) OR (F1 BETWEEN -10 AND 10))
            ORDER BY %s %s
            LIMIT 50

        ''' % (order, by)

        fullquery = queryhead + querycont + querytail + queryend
        # print('fq: \n ', fullquery)

        df = db.selectpd(fullquery)

        # print(len(df.columns),df.columns)
        # print(chartid, 'QUERY ', dt.now()-s)
        s=dt.now()


        rtdf = df[df.columns[2:]].round(4)

        def color_negative_red(val):
            """
            Takes a scalar and returns a string with
            the css property `'color: red'` for negative
            strings, black otherwise.
            """


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

#            return 'background-color: yellow'


        float_columns = rtdf.select_dtypes(include=[np.float64]).columns
        # print(float_columns)
        rtdf[float_columns[:-3]] = rtdf[float_columns[:-3]] * 100

        html = (
                rtdf.style
                .hide_index()
                .applymap(color_negative_red,subset=float_columns)
                .highlight_null('grey')
                .render()
        )


        # print(html)
        # print(chartid, 'PANDAS B', dt.now()-s)
        return html

    # 수급차트
    def sndChart(self, code):

        query = '''
                            SELECT A.STOCKNAME, A.STOCKCODE, CAST(A.DATE AS char) AS DATE, B.ADJRATIO 
                                , CNT
                                , FORMAT(ABS(B.CLOSE),0) AS FMTCLOSE
                               , B.OPEN, B.HIGH, B.LOW, B.CLOSE
                               , C.VOLUME
                               , C.FOREI
                               , C.INS, C.PER, C.YG, C.SAMO, C.TUSIN, C.FINAN, C.BANK, C.NATION, C.INSUR, C.OTHERCORPOR, C.OTHERFOR, C.OTHERFINAN
                               #, MG, GM, CS, MR, MQ, CL, UB, NM, DC, DW, JP, CT, SY, HT
                               , SBAL
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

                               , P1, P3, P5, P20, P60
                               , I1, I3, I5, I20, I60
                               , F1, F3, F5, F20, F60
                               , PS1, PS3, PS5, PS20, PS60
                               , YG1, YG3, YG5, YG20, YG60
                               , S1, S3, S5, S20, S60
                               , T1, T3, T5, T20, T60
                               , OC1, OC3, OC5, OC20, OC60
                               , FN1, FN3, FN5, FN20, FN60
                               , IR, FR, PR, YR, SR, TR, FNR, OCR

                            FROM
                            (
                               SELECT A.STOCKNAME, A.STOCKCODE, DIX.DATE, DIX.CNT
                               FROM jazzdb.T_STOCK_CODE_MGMT A

                               JOIN (

                                 SELECT DATE, CNT   
                                  FROM jazzdb.T_DATE_INDEXED
                                 WHERE CNT BETWEEN 0 AND 399

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
                            
                            LEFT JOIN (
                               SELECT STOCKCODE, DATE, SBAL
                               FROM jazzdb.T_STOCK_SHORT
                            ) E ON (A.STOCKCODE = E.STOCKCODE AND A.DATE = E.DATE )
                            
                            LEFT JOIN jazzdb.T_STOCK_SND_ANALYSIS_RESULT_TEMP X ON (A.STOCKCODE = X.STOCKCODE AND A.DATE = X.DATE);
        ''' % (code, code)

        self.getConn()
        cursor = self.cnxn.cursor()
        cursor.execute(query)
        rt = {'result':
                  [dict(zip([str(column[0]).replace("b'", '').replace("'", '') for column in cursor.description],
                            row))
                   for row in cursor.fetchall()]}

        # 부가정보
        df = pd.DataFrame(columns=rt['result'][0].keys(), data=[l.values() for l in rt['result']])

        df = df[df['CNT']%10==0]
        df['CLOSE']=df['FMTCLOSE']
        df = df[['DATE','CLOSE',
                 'P1', 'P5', 'P20', 'P60',
                  'I1', 'I5', 'I20', 'I60',
                  'F1', 'F5', 'F20', 'F60',
                  'PS1', 'PS5', 'PS20', 'PS60',
                  'YG1', 'YG5', 'YG20', 'YG60',
                  'S1', 'S5', 'S20', 'S60',
                  'T1', 'T5', 'T20', 'T60',
                  'FN1', 'FN5', 'FN20', 'FN60',
                  'OC1', 'OC5', 'OC20', 'OC60',
                  'IR', 'FR', 'PR', 'YR', 'SR', 'TR', 'FNR','OCR']].sort_values(by='DATE',ascending = False).head(30).round(4)

        def color_negative_red(val):
            """
            Takes a scalar and returns a string with
            the css property `'color: red'` for negative
            strings, black otherwise.
            """

            if (val > 30):
                color = '#ff3300'
            elif (val > 20):
                color = '#ff3d0d'
            elif (val > 10):
                color = '#ffad99'
            elif (val > 8):
                color = '#ffb8a6'
            elif (val > 6):
                color = '#ffc2b2'
            elif (val > 4):
                color = '#ffccbf'
            elif (val > 2):
                color = '#ffd6cc'
            elif (val > 1):
                color = '#ffe0d9'
            elif (val > 0.5):
                color = '#ffebe6'
            elif (val > -0.5):
                color = '#ffffff'
            elif (val > -1):
                color = '#e6f0fa'
            elif (val > -2):
                color = '#d9e8f7'
            elif (val > -4):
                color = '#cce0f5'
            elif (val > -6):
                color = '#bfd9f2'
            elif (val > -8):
                color = '#b2d1f0'
            elif (val > -10):
                color = '#3385d6'
            elif (val > -20):
                color = '#1a75d1'
            elif (val > -30):
                color = '#0066cc'
            else:
                color = '#1a47a3'
            return 'background-color: %s' % color

        #            return 'background-color: yellow'

        # float_columns = df.select_dtypes(include=[np.float64]).columns
        # print(float_columns)

        float_columns = ['P1', 'P5', 'P20', 'P60',
                         'I1', 'I5', 'I20', 'I60',
                  'F1', 'F5', 'F20', 'F60',
                  'PS1', 'PS5', 'PS20', 'PS60',
                  'YG1', 'YG5', 'YG20', 'YG60',
                  'S1', 'S5', 'S20', 'S60',
                  'T1', 'T5', 'T20', 'T60',
                  'FN1', 'FN5', 'FN20', 'FN60',
                  'OC1', 'OC5', 'OC20', 'OC60',]
        df[float_columns] = df[float_columns] * 100

        html = (
            df.style
                .hide_index()
                .applymap(color_negative_red, subset=float_columns)
                .highlight_null('grey')
                .render())


        self.closeConn()
        return rt, html


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
