from jazzstock_net.app.common import connector_db as db
import pandas as pd
import json
import random
import string
from datetime import datetime
from jazzstock_net.app.config.config_table_specification import spec_list_float_column


pd.options.display.max_rows = 2500

class DataAccessObjectSimulation:

    def __init__(self):
        pass

    def get_simulation_result_direct(self, from_date, to_date, conditions):


        select_query = '''
        SELECT A.DATE, CONCAT(B.STOCKCODE, '_', B.STOCKNAME) AS  STOCKNAME, B.STOCKCODE, SUBSTRING(A.DATE,3,2) AS YY, SUBSTRING(A.DATE,6,2) AS MM
            
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
        JOIN (
            SELECT STOCKCODE, CLOSE AS RCLSE
            FROM jazzdb.T_STOCK_OHLC_DAY
            WHERE DATE = "%s"
            
        ) AS O ON (A.STOCKCODE = O.STOCKCODE)
        
        WHERE 1=1
        AND A.DATE BETWEEN "%s" AND "%s"
        '''%(to_date, from_date, to_date)

        features = ['CLOSE', 'RCLSE', 'MC', 'P1', 'P5', 'P20', 'I1', 'I5', 'I20', 'F1', 'F5', 'F20', 'BBP','BBW',
                    'PSMAR5 AS PMA5',
                    'PSMAR20 AS PMA20',
                    'PSMAR60 AS PMA60',
                    'PSMAR120 AS PMA120',
                    'VSMAR5 AS VMA5',
                    'VSMAR20 AS VMA20',
                    'VSMAR60 AS VMA60',
                    'VSMAR120 AS VMA120']
        for condition in conditions:
            feature_name_full = condition.get("feature_name_full")
            if feature_name_full is not None and feature_name_full not in features\
                    and "SMAR" not in feature_name_full:
                features.append(feature_name_full)





        features += ['PRO1','PRO3','PRO5','PRO10','PRH1', 'PRH3', 'PRH5', 'PRH10']

        for feature in features:
            select_query = select_query + ", %s"%(feature)
        for condition in conditions:


            feature_name_full = condition.get("feature_name_full")
            operation = condition.get("operation")
            target_value = condition.get("target_value")

            if not target_value.isnumeric():
                target_value = "'%s'"%(target_value)



            base_query = base_query + "        AND %s %s %s\n"%(feature_name_full,
                                                                operation,
                                                                target_value)


        base_query = base_query + "        ORDER BY A.DATE ASC"

        try:
            rtdf = db.selectpd(select_query+base_query)
            # # PERCENT COLUMNS 처리
            float_columns = []
            for column in rtdf.columns.tolist():
                if column in spec_list_float_column:
                    float_columns.append(column)

            # ALIAS 처리

            rtdf[float_columns] = rtdf[float_columns] * 100
            rtdf[float_columns] = rtdf[float_columns].round(3)
            rtdf = rtdf.fillna(0)

            print(rtdf.sort_values(by="DATE", ascending=False).head(20))

            html_columns = [x for x in rtdf.columns.tolist() if x not in ['STOCKCODE', 'YY', 'MM']]
            json_columns = ['STOCKCODE', 'DATE', 'YY', 'MM', 'BBW', 'BBP',
                            'PMA5', 'PMA20', 'PMA60', 'PMA120', 'VMA5', 'VMA20', 'VMA60', 'VMA120',
                            'I1', 'I5','I20', 'F1', 'F5', 'F20',
                            'PRO1', 'PRO3', 'PRO5', 'PRO10', 'PRH1', 'PRH3', 'PRH5', 'PRH10']

            html = (
                rtdf.sort_values(by="DATE", ascending=False)[html_columns].style
                    .hide_index()
                    .render()
            )



            return {"simulation_result_table_html":html,
                    "simulation_result_column_list":html_columns,
                    "simulation_result_table_json": rtdf[json_columns].to_dict(orient='records')}

        except Exception as e:
            print(e)
            return {'message':e}


    def set_simulation_conditions(self, condition_set, usercode):

        while True:
            condition_set_id =  ''.join(random.choice(string.ascii_lowercase) for _ in range(22))
            query = "SELECT COUNT(*) FROM jazzstockuser.T_USER_SIMULATION_CONDITION WHERE CONDITION_SET_ID = '%s'"%(condition_set_id)
            is_not_unique = int(db.selectSingleValue(query))
            if not is_not_unique:
                break
            else:
                import time
                time.sleep(0.5)

        try:
            query = '''
                        
            INSERT INTO `jazzstockuser`.`T_USER_SIMULATION_CONDITION` 
            (`USERCODE`, 
            `CONDITION_SET_ID`, 
            `CONDITION_SET_NAME`, 
            `CONDITION_SET_DESCRIPTION`, 
            `CONDITION_SET_VALUE`, 
            `TIMESTAMP`, 
            `DEL_YN`) 
            VALUES ('%s', 
                    '%s', 
                    '%s', 
                    '%s',
                    '%s',
                    '%s',
                    '%s');
    
    
            '''%(usercode,
                 condition_set_id,
                 condition_set.get("condition_set_name"),
                 condition_set.get("condition_set_description"),
                 json.dumps(condition_set.get("condition_set")),
                 str(datetime.now()),
                 0)

            db.insert(query)
            return True

        except Exception as e:
            print(e)
            return e


    def get_simulation_conditions(self, usercode):

        try:

            query = '''
            
            SELECT CONDITION_SET_ID, CONDITION_SET_NAME, CONDITION_SET_DESCRIPTION, CONDITION_SET_VALUE, CAST(TIMESTAMP AS CHAR) AS TIMESTAMP
            FROM jazzstockuser.T_USER_SIMULATION_CONDITION
            WHERE 1=1
            AND USERCODE = '%s'
            AND DEL_YN = 0
            ORDER BY TIMESTAMP DESC
            '''%(usercode)


            df = db.selectpd(query)
            return {'result': [x for x in df.to_dict("index").values()]}

        except Exception as e:
            print("get_simulation_conditions", e)
            return {'result': False}


    def delete_simulation_condition(self, condition_set_id, usercode):

        try:

            query = '''

            DELETE FROM `jazzstockuser`.`T_USER_SIMULATION_CONDITION` 
            WHERE (`USERCODE` = '%s') and (`CONDITION_SET_ID` = '%s');

            ''' % (usercode, condition_set_id)

            df = db.delete(query)
            return {'result': True}

        except Exception as e:
            print("delete_simulation_condition", e)
            return {'result': False}
