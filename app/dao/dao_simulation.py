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
        SELECT A.DATE, CONCAT(B.STOCKCODE, '_', B.STOCKNAME) AS  STOCKNAME
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
        LEFT JOIN jazzdb.T_STOCK_FUTURE_PRICE N ON (A.STOCKCODE = N.STOCKCODE AND A.DATE = N.DATE)
        
        WHERE 1=1
        AND A.DATE BETWEEN "%s" AND "%s"
        '''%(from_date, to_date)

        features = ['MC','BBP','BBW','PSMAR5 AS PMA5','PSMAR60 AS PMA60','VSMAR5 AS VMA5','VSMAR60 AS VMA60']
        for condition in conditions:
            feature_name = condition.get("feature_name")
            if feature_name is not None and feature_name not in features and 'PSMA' not in feature_name and 'VSMA' not in feature_name:
                features.append(feature_name)


        features += ['PRO1','PRO3','PRO5','PRO10','PRH1', 'PRH3', 'PRH5', 'PRH10']

        for feature in features:
            select_query = select_query + ", %s"%(feature)
        for condition in conditions:
            base_query = base_query + "        AND %s %s %s\n"%(condition.get("feature_name"),
                                                      condition.get("operation"),
                                                      condition.get("target_value"))

        

        base_query = base_query + "        ORDER BY A.DATE DESC"

        try:
            df = db.selectpd(select_query+base_query)
            print(select_query+base_query)
            print(df)
            # return df.to_dict(orient="records")

            html = (
                df.style
                    .hide_index()
                    .render()
            )

            return html, df.columns.values.tolist()

        except Exception as e:
            return {}


