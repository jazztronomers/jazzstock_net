from jazzstock_net.app.common import connector_db as db
from datetime import datetime as dt
from jazzstock_net.app.config.config_others import PATH_ROOT
import pandas as pd
import pickle
import os


pd.options.display.max_rows = 2500

class DataAccessObjectSimulation:

    def __init__(self):
        pass

    def get_simulation_result_direct(self, from_date, to_date, conditions):


        select_query = '''
        SELECT A.DATE, STOCKNAME
        '''

        base_query = '''
        
        
        FROM jazzdb.T_STOCK_SND_ANALYSIS_RESULT_TEMP A
        JOIN jazzdb.T_STOCK_CODE_MGMT B USING (STOCKCODE)
        LEFT JOIN jazzdb.T_STOCK_SND_ANALYSIS_LONGTERM D USING (STOCKCODE, DATE)
        LEFT JOIN jazzdb.T_STOCK_BB_EVENT E ON (A.STOCKCODE = E.STOCKCODE AND A.DATE = E.DATE)
        #=========================================================================
        LEFT JOIN (

                    SELECT STOCKCODE, EPSC, BPS, ROE
                    FROM jazzdb.T_STOCK_FINAN E
                    WHERE 1=1
                    AND DATE = '2103'
                    AND TYPE = 'C'

        )F ON (A.STOCKCODE = F.STOCKCODE)
        LEFT JOIN jazzdb.T_STOCK_BB I ON (A.STOCKCODE = I.STOCKCODE AND A.DATE = I.DATE)
        LEFT JOIN jazzdb.T_STOCK_MC J ON (A.STOCKCODE = J.STOCKCODE AND A.DATE = J.DATE)
        LEFT JOIN jazzdb.T_STOCK_DAY_SMAR K ON (A.STOCKCODE = K.STOCKCODE AND A.DATE = K.DATE)        
        LEFT JOIN jazzdb.T_STOCK_SHARES_CIRCRATE M ON (A.STOCKCODE = M.STOCKCODE AND A.DATE = M.DATE)
        WHERE 1=1
        AND A.DATE BETWEEN "%s" AND "%s"
        '''%(from_date, to_date)

        for condition in conditions:
            select_query = select_query + ', %s'%(condition.get("feature"))
            base_query = base_query + "        AND %s %s %s\n"%(condition.get("feature"),
                                                      condition.get("operation"),
                                                      condition.get("target_value"))

        

        base_query = base_query + "        ORDER BY A.DATE DESC"

        try:
            df = db.selectpd(select_query+base_query)
            print(df)
            return df.to_dict(orient="records")

        except Exception as e:
            print(e)

            return {}


