import pyodbc
import constant as cs
import pandas as pd
ip = cs.ip
id = cs.id
pw = cs.pw
dbScheme = cs.dbScheme


port = '3306'
driver = 'MySQL ODBC 8.0 ANSI Driver'



def insert(query):



    cnxn = pyodbc.connect('DRIVER={MySQL ODBC 8.0 ANSI Driver};PORT=%s;SERVER=%s;DATABASE=%s;UID=%s;PWD=%s' % (
    port, ip, dbScheme, id, pw))

    # cnxn = mc.connect(host=ip, database=dbScheme, user=id, password=pw)
    cursor = cnxn.cursor()

    cursor.execute(query)
    # cursor.commit()
    cnxn.commit()
    cnxn.close()

def select(query):

    cnxn = pyodbc.connect('DRIVER={MySQL ODBC 8.0 ANSI Driver};PORT=%s;SERVER=%s;DATABASE=%s;UID=%s;PWD=%s' % (
    port, ip, dbScheme, id, pw))
#    cnxn = mc.connect(host=ip, database=dbScheme, user=id, password=pw)
    cursor = cnxn.cursor()
    cursor.execute(query)
    table = cursor.fetchall()

    eachRow = []
    rtrlist = []
    for x in table:
        for y in list(x):
            eachRow.append(y)
        rtrlist.append(eachRow)
        eachRow = []

    cnxn.close()
    return rtrlist






def delete(query):

    cnxn = pyodbc.connect('DRIVER={MySQL ODBC 8.0 ANSI Driver};PORT=%s;SERVER=%s;DATABASE=%s;UID=%s;PWD=%s' % (
    port, ip, dbScheme, id, pw))
#    cnxn = mc.connect(host=ip, database=dbScheme, user=id, password=pw)
    cursor = cnxn.cursor()
    cursor.execute(query,)

    cnxn.commit()
    cnxn.close()
    #return rtrlist



def selectInclueColumn(query):

    cnxn = pyodbc.connect('DRIVER={MySQL ODBC 8.0 ANSI Driver};PORT=%s;SERVER=%s;DATABASE=%s;UID=%s;PWD=%s' % (
    port, ip, dbScheme, id, pw))
#    cnxn = mc.connect(host=ip, database=dbScheme, user=id, password=pw)
    cursor = cnxn.cursor()
    cursor.execute(query)
    table = cursor.fetchall()

    eachRow = []
    rtrlist = []
    for x in table:
        for y in list(x):
            eachRow.append(y)
        rtrlist.append(eachRow)
        eachRow = []

    cnxn.close()
    columns = [column[0] for column in cursor.description]
    return rtrlist,columns



def selectSingleValue(query):
    cnxn = pyodbc.connect('DRIVER={MySQL ODBC 8.0 ANSI Driver};PORT=%s;SERVER=%s;DATABASE=%s;UID=%s;PWD=%s' % (
    port, ip, dbScheme, id, pw))
#    cnxn = mc.connect(host=ip, database=dbScheme, user=id, password=pw)
    cursor = cnxn.cursor()
    cursor.execute(query)
    table = cursor.fetchall()
    #print(type(table[0][0]))
    if(len(table) == 0):
        return None
    else:
        return table[0][0]


def selectSingleColumn(query):

    cnxn = pyodbc.connect('DRIVER={MySQL ODBC 8.0 ANSI Driver};PORT=%s;SERVER=%s;DATABASE=%s;UID=%s;PWD=%s' % (
    port, ip, dbScheme, id, pw))
#    cnxn = mc.connect(host=ip, database=dbScheme, user=id, password=pw)
    cursor = cnxn.cursor()
    cursor.execute(query)
    table = cursor.fetchall()

    rtlist = []

    for eachRow in table:
        rtlist.append(eachRow[0])

    return rtlist



def selectpd(q):

    rs = selectInclueColumn(q)
    column = [str(col).replace('b', '').replace("'", '') for col in rs[1]]
    dt = rs[0]
    df = pd.DataFrame(data=dt, columns=column)

    return df


if(__name__ == '__main__'):

    query = 'SELECT * FROM jazzdb.T_STOCK_CODE_MGMT'
    # test = selectInclueColumn(query)
    # print(test)

    print(selectpd(query))