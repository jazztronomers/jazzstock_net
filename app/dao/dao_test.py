from jazzstock_net.app.dao.dao_stock import DataAccessObjectStock
from sys import getsizeof



df = DataAccessObjectStock().sndRank(method='dataframe',
                                     targets=["P","I","F","YG","S"],
                                     intervals=[1,5,20,60,120],
                                     limit=2500,
                                     report_only=False,debug=True)

print(getsizeof(df))



## 무엇을
## 어떻게
