# import pyodbc
import mysql.connector as mc
import constant as cs
import requests
from datetime import datetime
from xml.etree import ElementTree as et
import pandas as pd
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


    def sndChart(self, code):

        self.getConn()
        cursor = self.cnxn.cursor()
        query = '''
                            SELECT A.STOCKNAME, A.STOCKCODE, CAST(A.DATE AS char) AS DATE, B.ADJRATIO 
                                , CNT
                               , B.OPEN, B.HIGH, B.LOW, B.CLOSE
                               , C.VOLUME
                               , C.FOREI
                               , C.INS, C.PER, C.YG, C.SAMO, C.TUSIN, C.FINAN, C.BANK, C.NATION, C.INSUR, C.OTHERCORPOR, C.OTHERFOR, C.OTHERFINAN
                               #, MG, GM, CS, MR, MQ, CL, UB, NM, DC, DW, JP, CT, SY, HT
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
                                 WHERE CNT BETWEEN 0 AND 299

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
                            ) D ON (A.STOCKCODE = D.STOCKCODE AND A.DATE = D.DATE );
        ''' % (code, code)
        cursor.execute(query)
        rt = {'result':
                  [dict(zip([str(column[0]).replace("b'",'').replace("'",'') for column in cursor.description], row))
                   for row in cursor.fetchall()]}



        self.closeConn()
        return rt



    def sndInfo(self,code):
        self.getConn()
        cursor = self.cnxn.cursor()
        query = '''
                        
                SELECT B.STOCKNAME

                    , CASE WHEN B.MARKET = '0' THEN '' ELSE '*' END AS MARKET
                    , DATE
                    , CLOSE
                    , C.CNT               
                    , P1, P5, P20, I1, I5, I20, F1, F5, F20, PS1, PS5, PS20, IR, FR, PR
                
                FROM jazzdb.T_STOCK_SND_ANALYSIS_RESULT_TEMP A
                JOIN (
                    SELECT STOCKCODE, STOCKNAME, MARKET
                    FROM jazzdb.T_STOCK_CODE_MGMT 
                    WHERE (STOCKCODE = '%s' OR STOCKNAME = '%s')
                ) B USING (STOCKCODE)
                JOIN jazzdb.T_DATE_INDEXED C USING (DATE)
                JOIN (
                
                    SELECT STOCKCODE, SHARE
                    FROM
                    (
                        SELECT STOCKCODE, SHARE, DATE,
                            ROW_NUMBER() OVER (PARTITION BY STOCKCODE ORDER BY DATE DESC) AS RN 
                        FROM jazzdb.T_STOCK_SHARES_INFO
                        WHERE 1=1
                        AND HOLDER = '발행주식수'
                    ) A
                    WHERE A.RN = 1
                
                ) D USING (STOCKCODE)

                WHERE 1=1
                AND C.CNT IN (0,1,2,3,5,20,60,120)
                ORDER BY DATE DESC
        
        ''' %(code,code)

        cursor.execute(query)
        column = cursor.column_names
        rt = {'result':
                  [dict(zip([column[0] for column in cursor.description], row))
                   for row in cursor.fetchall()]}



        self.closeConn()
        return rt, column

    def sndRank(self, column, interval, order, by, market, mcrange):


        queryhead = '''
        
                SELECT B.STOCKNAME
                    , CASE WHEN B.MARKET = '0' THEN '' ELSE '*' END AS MARKET
                    , CASE WHEN E.CATEGORY IS NULL THEN 'NONE' ELSE E.CATEGORY END AS CATEGORY
                    , FORMAT(D.SHARE*CLOSE/100000000000,1) AS MC
                    , DATE
                    , CLOSE,
    
        '''

        toselect = ['P','I','F']

        for each in column:
            toselect.append(each)


        querycont = ''
        for eachcolumn in toselect:
            for eachinterval in interval:
                querycont = querycont + str(eachcolumn)+str(eachinterval)+', '

        if(order[0]=='YG'):
            temp = 'Y'

        elif(order[0]=='PS'):
            temp = 'P'
        else:
            temp = order[0]
        querycont = querycont + temp + 'R'

        #print('[DEBUG]' , querycont)

        querytail= '''
        
            FROM jazzdb.T_STOCK_SND_ANALYSIS_RESULT_TEMP A
            JOIN jazzdb.T_STOCK_CODE_MGMT B USING (STOCKCODE)
            JOIN jazzdb.T_DATE_INDEXED C USING (DATE)
            JOIN (
            
                SELECT STOCKCODE, SHARE
                FROM
                (
                    SELECT STOCKCODE, SHARE, DATE,
                        ROW_NUMBER() OVER (PARTITION BY STOCKCODE ORDER BY DATE DESC) AS RN 
                    FROM jazzdb.T_STOCK_SHARES_INFO
                    WHERE 1=1
                    AND HOLDER = '발행주식수'
                ) A
                WHERE A.RN = 1
            
            ) D USING (STOCKCODE)
            LEFT JOIN ( 
            SELECT STOCKCODE, GROUP_CONCAT(CATEGORY) AS CATEGORY
            FROM jazzdb.T_STOCK_CATEGORY_ROBO
            GROUP BY STOCKCODE 
            )E
            USING(STOCKCODE)
            WHERE 1=1'''

        querycond = '''
        
            AND B.MARKET IN %s 
            AND (
        
        ''' % (str(market).replace('[','(').replace(']',')'))

        for i,each in enumerate(mcrange):
            #print(i,len(mcrange))
            querycond +=''' FORMAT(D.SHARE*CLOSE/100000000000,1) BETWEEN %s and %s 
            ''' %tuple(each.split(':'))
            if i < len(mcrange)-1:
                querycond +='''OR'''


        queryend = '''
            )
            AND (I1>0 OR F1>0) 
            AND C.CNT = 0
            AND ((I1 BETWEEN -10 AND 10) OR (F1 BETWEEN -10 AND 10))
            ORDER BY %s1 %s
            LIMIT 60
        
        '''%(order[0],by[0])

        fullquery = queryhead + querycont + querytail + querycond + queryend
        # print('fq: \n ', fullquery)


        self.getConn()
        cursor = self.cnxn.cursor()
        cursor.execute(fullquery)



        column = cursor.column_names
        rt = {'result':
                  [dict(zip([column[0] for column in cursor.description], row)) for row in cursor.fetchall()]}
        # print(column)
        # print(rt)


        dt =rt['result'][0]['DATE']



        self.closeConn()

        return column, rt, dt

    def sndRankMine(self, column, interval, codelist):

        # print("INPUT ", codelist)

        queryhead = '''

                SELECT B.STOCKNAME
                    , CASE WHEN B.MARKET = '0' THEN '' ELSE '*' END AS MARKET
                    , CASE WHEN E.CATEGORY IS NULL THEN 'NONE' ELSE E.CATEGORY END AS CATEGORY
                    , FORMAT(D.SHARE*CLOSE/100000000000,1) AS MC
                    , DATE
                    , CLOSE,

        '''

        toselect = ['P', 'I', 'F']

        for each in column:
            toselect.append(each)

        querycont = ''
        for eachcolumn in toselect:
            for eachinterval in interval:
                querycont = querycont + str(eachcolumn) + str(eachinterval) + ', '

        querycont = querycont + 'IR'

        # print('[DEBUG]' , querycont)

        querytail = '''

            FROM jazzdb.T_STOCK_SND_ANALYSIS_RESULT_TEMP A
            JOIN jazzdb.T_STOCK_CODE_MGMT B USING (STOCKCODE)
            JOIN jazzdb.T_DATE_INDEXED C USING (DATE)
            JOIN (

                SELECT STOCKCODE, SHARE
                FROM
                (
                    SELECT STOCKCODE, SHARE, DATE,
                        ROW_NUMBER() OVER (PARTITION BY STOCKCODE ORDER BY DATE DESC) AS RN 
                    FROM jazzdb.T_STOCK_SHARES_INFO
                    WHERE 1=1
                    AND HOLDER = '발행주식수'
                ) A
                WHERE A.RN = 1

            ) D USING (STOCKCODE)
            LEFT JOIN ( 
            SELECT STOCKCODE, GROUP_CONCAT(CATEGORY) AS CATEGORY
            FROM jazzdb.T_STOCK_CATEGORY_ROBO
            GROUP BY STOCKCODE 
            )E
            USING(STOCKCODE)
            WHERE 1=1
            AND ('''




        stocklist = str(codelist)[2:-2].split('/')
        # print("STOCKLIST", len(stocklist),stocklist)

        tempcode = ' STOCKCODE IN ('
        for each in str(codelist)[2:-2].split('/'):
            tempcode = tempcode + "'" +  each +"',"

        tempcode = tempcode[:-1] + ')'

        tempname = ' OR STOCKNAME IN ('
        for each in str(codelist)[2:-2].split('/'):
            tempname = tempname + "'" +  each +"',"

        tempname = tempname[:-1] + '))'


        # print("DEBUG ", tempcode + tempname)


        queryend = '''

            AND C.CNT = 0
            ORDER BY I1 DESC
            LIMIT 50
        '''


        fullquery = queryhead + querycont + querytail + tempcode + tempname + queryend


        # print('fq: \n ', fullquery)

        self.getConn()
        cursor = self.cnxn.cursor()
        cursor.execute(fullquery)

        column = cursor.column_names
        rt = {'result':
                  [dict(zip([column[0] for column in cursor.description], row)) for row in cursor.fetchall()]}

        if(len(rt['result'])==0):
            dt = datetime.now().date()
        else:
            dt = rt['result'][0]['DATE']
        # dt = '2019-12-12'

        self.closeConn()

        return column, rt, dt


    def sndIndependent(self,order, by):

        column = ['FR', 'IR', 'YR', 'SR', 'TR', 'FNR', 'ISR', 'NTR', 'BKR', 'OCR']
        interval = [1,5]
        queryhead = '''
    
                SELECT B.STOCKNAME, DATE, CLOSE, 
    
    
        '''

        toselect = ['P', 'F', 'I']



        querycont = ''
        for eachcolumn in toselect:
            for eachinterval in interval:
                querycont = querycont + str(eachcolumn) + str(eachinterval) + ', '

        for each in column:
            querycont = querycont + str(each) + ', '

        #print('[DEBUG]', querycont[:-2])

        querytail = '''
    
            FROM jazzdb.T_STOCK_SND_ANALYSIS_RESULT_TEMP A
            JOIN jazzdb.T_STOCK_CODE_MGMT B USING (STOCKCODE)
            JOIN jazzdb.T_DATE_INDEXED C USING (DATE)
            WHERE 1=1
            AND (
                (I1>0.005 AND IR <100) OR 
                (F1>0.005 AND FR <100) OR 
                (YG1>0.0025 AND YR <100) OR 
                (S1>0.0025 AND SR <100) OR 
                (T1>0.0025 AND TR <100) OR 
                (FN1>0.0025 AND FNR <100) OR 
                (IS1>0.0025 AND ISR <100) OR 
                (NT1>0.0025 AND NTR <100) OR 
                (BK1>0.0025 AND BKR <100) OR 
                (OC1>0.0025 AND OCR <100)
                
            )
            AND C.CNT = 0
            AND ((I1 BETWEEN -10 AND 10) OR (F1 BETWEEN -10 AND 10))
            ORDER BY %sR %s
            LIMIT 50
    
        ''' % (order[0], by[0])

        fullquery = queryhead + querycont[:-2] + querytail
        #print('fq: \n ', fullquery)

        self.getConn()
        cursor = self.cnxn.cursor()
        cursor.execute(fullquery)


        column = cursor.column_names
        rt = {'result':
                  [dict(zip([column[0] for column in cursor.description], row)) for row in cursor.fetchall()]}

        dt = rt['result'][0]['DATE']
        # dt = '2019-12-12'

        self.closeConn()

        return column, rt, dt

    def recommSummary(self):

        query = '''


                SELECT RS.MID, RS.MNAME, RS.DETAIL, RS.CNT
                ,RS.1M_PR_MEAN AS M1
                ,RS.2M_PR_MEAN AS M2
                ,RS.3M_PR_MEAN AS M3
                ,RS.4M_PR_MEAN AS M4
                ,RS.5M_PR_MEAN AS M5
                ,RS.6M_PR_MEAN AS M6
                
                ,RS.1M_PR_STD AS STD1
                ,RS.2M_PR_STD AS STD2
                ,RS.3M_PR_STD AS STD3
                ,RS.4M_PR_STD AS STD4
                ,RS.5M_PR_STD AS STD5
                ,RS.6M_PR_STD AS STD6
                
                FROM
                (
                
                    SELECT A.MID, A.MNAME, A.DETAIL, A.CNT, TAG
                                    , SUM(MEAN_PR) 	 OVER (PARTITION BY A.MID ORDER BY TAG ASC ROWS BETWEEN 5 PRECEDING AND 5 PRECEDING) AS 1M_PR_MEAN
                                    , SUM(MEAN_PR) 	 OVER (PARTITION BY A.MID ORDER BY TAG ASC ROWS BETWEEN 4 PRECEDING AND 4 PRECEDING) AS 2M_PR_MEAN
                                    , SUM(MEAN_PR) 	 OVER (PARTITION BY A.MID ORDER BY TAG ASC ROWS BETWEEN 3 PRECEDING AND 3 PRECEDING) AS 3M_PR_MEAN
                                    , SUM(MEAN_PR) 	 OVER (PARTITION BY A.MID ORDER BY TAG ASC ROWS BETWEEN 2 PRECEDING AND 2 PRECEDING) AS 4M_PR_MEAN
                                    , SUM(MEAN_PR) 	 OVER (PARTITION BY A.MID ORDER BY TAG ASC ROWS BETWEEN 1 PRECEDING AND 1 PRECEDING) AS 5M_PR_MEAN
                                    , SUM(MEAN_PR) 	 OVER (PARTITION BY A.MID ORDER BY TAG ASC ROWS BETWEEN 0 PRECEDING AND 0 PRECEDING) AS 6M_PR_MEAN
                                    
                                    
                                    , SUM(STDDEV_PR) OVER (PARTITION BY A.MID ORDER BY TAG ASC ROWS BETWEEN 5 PRECEDING AND 5 PRECEDING) AS 1M_PR_STD
                                    , SUM(STDDEV_PR) OVER (PARTITION BY A.MID ORDER BY TAG ASC ROWS BETWEEN 4 PRECEDING AND 4 PRECEDING) AS 2M_PR_STD
                                    , SUM(STDDEV_PR) OVER (PARTITION BY A.MID ORDER BY TAG ASC ROWS BETWEEN 3 PRECEDING AND 3 PRECEDING) AS 3M_PR_STD
                                    , SUM(STDDEV_PR) OVER (PARTITION BY A.MID ORDER BY TAG ASC ROWS BETWEEN 2 PRECEDING AND 2 PRECEDING) AS 4M_PR_STD
                                    , SUM(STDDEV_PR) OVER (PARTITION BY A.MID ORDER BY TAG ASC ROWS BETWEEN 1 PRECEDING AND 1 PRECEDING) AS 5M_PR_STD
                                    , SUM(STDDEV_PR) OVER (PARTITION BY A.MID ORDER BY TAG ASC ROWS BETWEEN 0 PRECEDING AND 0 PRECEDING) AS 6M_PR_STD
                                                                                    
                    FROM
                
                    (
                
                        SELECT A.MID, A.MNAME, A.DETAIL, A.CNT,
                            CASE WHEN D.CNT < 10 THEN 0
                            WHEN D.CNT < 30 THEN 1
                            WHEN D.CNT < 50 THEN 2
                            WHEN D.CNT < 70 THEN 3
                            WHEN D.CNT < 90 THEN 4
                            WHEN D.CNT < 110 THEN 5
                            ELSE 9 END AS TAG,
                            AVG(C.PRO10) AS MEAN_PR, STDDEV(C.PRO10) AS STDDEV_PR
                        FROM jazzdb.T_RECOMM_TAG A
                        JOIN jazzdb.T_RECOMM_LIST B USING (MID)
                        JOIN jazzdb.T_STOCK_FUTURE_PRICE_NEW C USING (STOCKCODE, DATE)
                        JOIN jazzdb.T_DATE_INDEXED D USING(DATE)
                        WHERE 1=1
                        AND A.MID NOT LIKE '%TEST%'
                        # AND A.MID = 'RB00000001'
                        GROUP BY A.MID, A.MNAME, A.DETAIL, TAG
                        ORDER BY A.MNAME ASC
                    ) A
                ) RS
                
                WHERE RS.TAG = '9'
                ORDER BY MNAME ASC

        '''

        self.getConn()
        cursor = self.cnxn.cursor()
        cursor.execute(query)

        column = cursor.column_names
        table = {'result':
                     [dict(zip([column[0] for column in cursor.description], row)) for row in cursor.fetchall()]}


        return column, table

    def recommSummaryTest(self):

        query = '''


                SELECT RS.MID, RS.MNAME, RS.CNT
                ,RS.1M_PR_MEAN AS M1
                ,RS.2M_PR_MEAN AS M2
                ,RS.3M_PR_MEAN AS M3
                ,RS.4M_PR_MEAN AS M4
                ,RS.5M_PR_MEAN AS M5
                ,RS.6M_PR_MEAN AS M6

                ,RS.1M_PR_STD AS STD1
                ,RS.2M_PR_STD AS STD2
                ,RS.3M_PR_STD AS STD3
                ,RS.4M_PR_STD AS STD4
                ,RS.5M_PR_STD AS STD5
                ,RS.6M_PR_STD AS STD6

                FROM
                (

                    SELECT A.MID, A.MNAME, A.DETAIL, A.CNT, TAG
                                    , SUM(MEAN_PR) 	 OVER (PARTITION BY A.MID ORDER BY TAG ASC ROWS BETWEEN 5 PRECEDING AND 5 PRECEDING) AS 1M_PR_MEAN
                                    , SUM(MEAN_PR) 	 OVER (PARTITION BY A.MID ORDER BY TAG ASC ROWS BETWEEN 4 PRECEDING AND 4 PRECEDING) AS 2M_PR_MEAN
                                    , SUM(MEAN_PR) 	 OVER (PARTITION BY A.MID ORDER BY TAG ASC ROWS BETWEEN 3 PRECEDING AND 3 PRECEDING) AS 3M_PR_MEAN
                                    , SUM(MEAN_PR) 	 OVER (PARTITION BY A.MID ORDER BY TAG ASC ROWS BETWEEN 2 PRECEDING AND 2 PRECEDING) AS 4M_PR_MEAN
                                    , SUM(MEAN_PR) 	 OVER (PARTITION BY A.MID ORDER BY TAG ASC ROWS BETWEEN 1 PRECEDING AND 1 PRECEDING) AS 5M_PR_MEAN
                                    , SUM(MEAN_PR) 	 OVER (PARTITION BY A.MID ORDER BY TAG ASC ROWS BETWEEN 0 PRECEDING AND 0 PRECEDING) AS 6M_PR_MEAN


                                    , SUM(STDDEV_PR) OVER (PARTITION BY A.MID ORDER BY TAG ASC ROWS BETWEEN 5 PRECEDING AND 5 PRECEDING) AS 1M_PR_STD
                                    , SUM(STDDEV_PR) OVER (PARTITION BY A.MID ORDER BY TAG ASC ROWS BETWEEN 4 PRECEDING AND 4 PRECEDING) AS 2M_PR_STD
                                    , SUM(STDDEV_PR) OVER (PARTITION BY A.MID ORDER BY TAG ASC ROWS BETWEEN 3 PRECEDING AND 3 PRECEDING) AS 3M_PR_STD
                                    , SUM(STDDEV_PR) OVER (PARTITION BY A.MID ORDER BY TAG ASC ROWS BETWEEN 2 PRECEDING AND 2 PRECEDING) AS 4M_PR_STD
                                    , SUM(STDDEV_PR) OVER (PARTITION BY A.MID ORDER BY TAG ASC ROWS BETWEEN 1 PRECEDING AND 1 PRECEDING) AS 5M_PR_STD
                                    , SUM(STDDEV_PR) OVER (PARTITION BY A.MID ORDER BY TAG ASC ROWS BETWEEN 0 PRECEDING AND 0 PRECEDING) AS 6M_PR_STD

                    FROM

                    (

                        SELECT A.MID, A.MNAME, A.DETAIL, A.CNT,
                            CASE WHEN D.CNT < 10 THEN 0
                            WHEN D.CNT < 30 THEN 1
                            WHEN D.CNT < 50 THEN 2
                            WHEN D.CNT < 70 THEN 3
                            WHEN D.CNT < 90 THEN 4
                            WHEN D.CNT < 110 THEN 5
                            ELSE 9 END AS TAG,
                            AVG(C.PRO10) AS MEAN_PR, STDDEV(C.PRO10) AS STDDEV_PR
                        FROM jazzdb.T_RECOMM_TAG_TEST A
                        JOIN jazzdb.T_RECOMM_LIST_TEST B USING (MID)
                        JOIN jazzdb.T_STOCK_FUTURE_PRICE_NEW C USING (STOCKCODE, DATE)
                        JOIN jazzdb.T_DATE_INDEXED D USING(DATE)
                        WHERE 1=1
                        AND A.MID NOT LIKE '%TEST%'
                        # AND A.MID = 'RB00000001'
                        GROUP BY A.MID, A.MNAME, A.DETAIL, TAG
                        ORDER BY A.MNAME ASC
                    ) A
                ) RS

                WHERE RS.TAG = '9'

        '''

        self.getConn()
        cursor = self.cnxn.cursor()
        cursor.execute(query)

        column = cursor.column_names
        table = {'result':
                     [dict(zip([column[0] for column in cursor.description], row)) for row in cursor.fetchall()]}

        return column, table

    def recommList(self,mid):

        query = '''


        SELECT A.MID, A.DATE, B.STOCKNAME, D.CLOSE, LATEST, C.PRH10, C.PRL10, C.PRO1, C.PRO3, C.PRO5, C.PRO10,
                AVG(PRO10) OVER (PARTITION BY A.DATE) AS GRP_PRO10
        FROM jazzdb.T_RECOMM_LIST A
        JOIN jazzdb.T_STOCK_CODE_MGMT B USING (STOCKCODE)
        JOIN jazzdb.T_STOCK_FUTURE_PRICE_NEW C USING (STOCKCODE, DATE)
        JOIN jazzdb.T_STOCK_SND_ANALYSIS_RESULT_TEMP D USING (STOCKCODE,DATE)
        JOIN (
			  SELECT STOCKCODE, ABS(CLOSE) AS LATEST
			  FROM jazzdb.T_STOCK_SND_DAY 
			  JOIN jazzdb.T_DATE_INDEXED USING (DATE)
			  WHERE CNT = 0 
              ) E
              USING (STOCKCODE)
        WHERE 1=1
        AND A.MID = '%s'
        ORDER BY DATE DESC, I1 DESC
        
        LIMIT 150

        '''%(mid)

        self.getConn()
        cursor = self.cnxn.cursor()
        cursor.execute(query)

        column = []
        for eachcol in cursor.column_names:
            column.append(str(eachcol).replace('b', '').replace("'", ''))
        table = {'result':
                     [dict(zip([str(column[0]).replace('b', '').replace("'", '') for column in cursor.description], row)) for row in cursor.fetchall()]}


        self.closeConn()
        return column, table

    def recommListTest(self, mid):

        query = '''


        SELECT A.MID, A.DATE, B.STOCKNAME, D.CLOSE, LATEST, I1, I5, I20, F1, F5, F20, C.PRO10, C.PRH10, C.PRL10, 
                AVG(PRO10) OVER (PARTITION BY A.DATE) AS GRP_PRO10
        FROM jazzdb.T_RECOMM_LIST_TEST A
        JOIN jazzdb.T_STOCK_CODE_MGMT B USING (STOCKCODE)
        JOIN jazzdb.T_STOCK_FUTURE_PRICE_NEW C USING (STOCKCODE, DATE)
        JOIN jazzdb.T_STOCK_SND_ANALYSIS_RESULT_TEMP D USING (STOCKCODE,DATE)
        JOIN (
              SELECT STOCKCODE, ABS(CLOSE) AS LATEST
              FROM jazzdb.T_STOCK_SND_DAY 
              JOIN jazzdb.T_DATE_INDEXED USING (DATE)
              WHERE CNT = 0 
              ) E
              USING (STOCKCODE)
        WHERE 1=1
        AND A.MID = '%s'
        ORDER BY DATE DESC

        LIMIT 150

        ''' % (mid)

        self.getConn()
        cursor = self.cnxn.cursor()
        cursor.execute(query)

        column = []
        for eachcol in cursor.column_names:
            column.append(str(eachcol).replace('b', '').replace("'", ''))
        table = {'result':
                     [dict(zip([str(column[0]).replace('b', '').replace("'", '') for column in cursor.description],
                               row)) for row in cursor.fetchall()]}

        self.closeConn()
        return column, table

    # 입력값이 DB에 존재하는지 확인하는 메소드
    def nameCodeValidation(self,stockcode):

        self.getConn()
        cursor = self.cnxn.cursor()
        query = '''

                               SELECT A.STOCKNAME, A.STOCKCODE
                               FROM jazzdb.T_STOCK_CODE_MGMT A
                               WHERE 1=1
                               AND (STOCKCODE = '%s' OR STOCKNAME = '%s')

                            ;
        ''' % (stockcode,stockcode)
        cursor.execute(query)
        dbrs = cursor.fetchall()
        if (len(dbrs)) > 0:
            rs = [True,dbrs[0]]
        else:
            rs = [False,None]

        self.closeConn()
        return rs

    @DeprecationWarning
    def krxStockinfo(self,stockcode):

        #print('[DEBUG] STOCKINFO METHOD LAUNCHED', stockcode)
        url = 'http://asp1.krx.co.kr/servlet/krx.asp.XMLSise?code=%s' %(stockcode)
        xml = et.fromstring(requests.get(url).content.strip())
        # keys = ['day_Date','day_Start','day_High','day_Low','day_EndPrice','day_Volume','day_getAmount']
        keys = ['day_Date', 'day_Start', 'day_High', 'day_Low', 'day_EndPrice', 'day_Volume']
        convertKeys = {

            'day_Date':'DATE',
            'day_Start':'OPEN',
            'day_High':'HIGH',
            'day_Low':'LOW',
            'day_EndPrice':'CLOSE',
            'day_Volume':'VOLUME',
        }
        rtlist = []
        for each in xml:
            for eachnode in each:
                eachrow = {}
                if(eachnode.tag == 'DailyStock'):
                    for eachkey in keys:
                        # 날짜 포맷팅
                        if(eachkey=='day_Date'):
                            #eachrow.append('20'+eachnode.attrib[eachkey].replace('/','-'))
                            eachrow[convertKeys[eachkey]]='20'+eachnode.attrib[eachkey].replace('/','-')
                        else:

                            eachrow[convertKeys[eachkey]] = int(eachnode.attrib[eachkey].replace(',',''))

                    rtlist.append(eachrow)

        #print('[DEBUG] STOCKINFO METHOD RETURN VALUE', rtlist)
        #print('[DEBUG] STOCKINFO METHOD FINISHED', stockcode)

        if(len(rtlist)>0):
            return rtlist[0]
        else:
            return None



    def sndChartForei(self, code):

        self.getConn()
        cursor = self.cnxn.cursor()
        query = '''
                           SELECT A.STOCKNAME, A.STOCKCODE, CAST(A.DATE AS char) AS DATE, B.ADJRATIO 
                               , B.OPEN, B.HIGH, B.LOW, B.CLOSE
                               , C.VOLUME
                               , C.FOREI
                               , C.INS, C.PER, C.YG, C.SAMO, C.TUSIN, C.FINAN, C.BANK, C.NATION, C.INSUR, C.OTHERCORPOR, C.OTHERFOR, C.OTHERFINAN


                            FROM
                            (
                               SELECT A.STOCKNAME, A.STOCKCODE, DIX.DATE
                               FROM jazzdb.T_STOCK_CODE_MGMT A

                               JOIN (

                                 SELECT DATE   
                                  FROM jazzdb.T_DATE_INDEXED
                                 WHERE CNT BETWEEN 0 AND 299

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
                            ;
        ''' % (code, code)
        cursor.execute(query)
        rt = {'result':
                  [dict(zip([column[0] for column in cursor.description], row))
                   for row in cursor.fetchall()]}

    def recommSummaryOld(self):

        query = '''


        SELECT MID, MNAME, DETAIL, CNT 
        FROM jazzdb.T_RECOMM_TAG
        WHERE MID NOT LIKE '%TEST%'
        ORDER BY MID ASC;


        '''

        self.getConn()
        cursor = self.cnxn.cursor()
        cursor.execute(query)

        column = cursor.column_names
        table = {'result':
                     [dict(zip([column[0] for column in cursor.description], row)) for row in cursor.fetchall()]}

        q = '''


        SELECT A.MID, E.CNT, A.DATE, FORMAT(AVG(C.PRO10),3) AS PRO10, COUNT(*)
        FROM jazzdb.T_RECOMM_LIST A
        JOIN jazzdb.T_RECOMM_TAG D USING (MID)
        JOIN jazzdb.T_STOCK_CODE_MGMT B USING (STOCKCODE)
        JOIN jazzdb.T_STOCK_FUTURE_PRICE_NEW C USING (STOCKCODE, DATE)
        JOIN jazzdb.T_DATE_INDEXED E USING(DATE)
        GROUP BY A.MID, A.DATE, E.CNT
        ORDER BY D.MID ASC

        '''

        rs = db.selectInclueColumn(q)

        # print(query+trainTail)
        col = [str(col).replace('b', '').replace("'", '') for col in rs[1]]
        data = rs[0]
        df = pd.DataFrame(data=data, columns=col)

        for x, each in enumerate(df['MID'].drop_duplicates().values):

            try:
                lenA = ((1 / len(df[(df.MID == each) & (df.CNT < 30) & (df.CNT > 9)].PRO10.values)))
                iA = 1
                for j in df[(df.MID == each) & (df.CNT < 30) & (df.CNT > 9)].PRO10.values:
                    iA *= 1 + float(j)
                table['result'][x]['GM10'] = (iA ** lenA) - 1
            except:
                table['result'][x]['GM10'] = '-'
            try:
                lenB = ((1 / len(df[(df.MID == each) & (df.CNT < 50) & (df.CNT > 29)].PRO10.values)))
                iB = 1
                for j in df[(df.MID == each) & (df.CNT < 50) & (df.CNT > 29)].PRO10.values:
                    iB *= 1 + float(j)
                table['result'][x]['GM30'] = (iB ** lenB) - 1
            except:

                table['result'][x]['GM30'] = '-'

            try:
                lenC = ((1 / len(df[(df.MID == each) & (df.CNT < 70) & (df.CNT > 49)].PRO10.values)))
                iC = 1
                for j in df[(df.MID == each) & (df.CNT < 70) & (df.CNT > 49)].PRO10.values:
                    iC *= 1 + float(j)
                table['result'][x]['GM50'] = (iC ** lenC) - 1
            except:
                table['result'][x]['GM50'] = '-'

            try:
                lenD = ((1 / len(df[(df.MID == each) & (df.CNT < 90) & (df.CNT > 69)].PRO10.values)))
                iD = 1
                for j in df[(df.MID == each) & (df.CNT < 90) & (df.CNT > 69)].PRO10.values:
                    iD *= 1 + float(j)
                table['result'][x]['GM70'] = (iD ** lenD) - 1
            except:
                table['result'][x]['GM70'] = '-'

            try:
                lenD = ((1 / len(df[(df.MID == each) & (df.CNT < 110) & (df.CNT > 89)].PRO10.values)))
                iD = 1
                for j in df[(df.MID == each) & (df.CNT < 110) & (df.CNT > 89)].PRO10.values:
                    iD *= 1 + float(j)
                table['result'][x]['GM90'] = (iD ** lenD) - 1
            except:
                table['result'][x]['GM90'] = '-'

            #
            # table['result'][x]['GM30']= (iA**lenA)-1
            # table['result'][x]['GM50']= (iB**lenB)-1
            # table['result'][x]['GM70']= (iC**lenC)-1

        self.closeConn()
        column = column + tuple(['GM10', 'GM30', 'GM50', 'GM70', 'GM90'])
        return column, table