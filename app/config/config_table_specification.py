'''
TABLE SPECIFICATION을 CONFIGURABLE하게 파이썬 DICTIONARY 로 저장해두는 소스
향후 Client Side에서 본 Dictionary를 json object로 받아서
Conditional formatting 또는 tooltip을 띄울 수 있도록
'''



table_column_specification = [
        {
                "column_name":"STOCKNAME",
                "column_child":["STOCKNAME"],
                "column_name_full":"STOCKNAME",
                "column_description":"종목명",
                "data_type":'str',
                "column_def":{"width":90,
                              "created_cell":"stockname"},
        },{
                "column_name":"MC",
                "column_name_full": "Market Capital",
                "column_description":'''
                Market Capital의 약자로, 당 종목의 시가총액(천억)을 의미하며, "당일 종가 x 발행주식수"로 매 거래일마다 계산됩니다.<br>
                일부 우선주의 경우 발행주식수 원천데이터가 잘못되어 시가총액이 높게 계산되고 있습니다, 양해 바랍니다.''',
                "data_type":'float',
                "column_def": {"width": 30,
                             'render':1,
                             'orderSequence':["desc","asc"]},
        },{
                "column_name":"FAV",
                "column_name_full": "Favorite",
                "column_description":'''
                즐겨찾기 등록을 위한 체크박스입니다<br>
                즐겨찾기로 등록하고자 하는 종목 옆 체크박스를 체크후, 아래 <즐겨찾기 업데이트> 버튼을 클릭하시면<br>
                체크된 종목들이 즐겨찾기 종목으로 등록되며, 향후 모든테이블에서 노란색으로 Highlighting 됩니다<br>
                추가로 <즐겨찾기> 탭에서 별도로 모아서 조회할 수 있습니다.''',
                "data_type":"checkbox",
                "column_def": {"width": 20,
                               "created_cell":"fav"},

        },{
                "column_name":"CLOSE",
                "column_name_full": "Close price",
                "column_description":"당일종가를 의미합니다.",
                "data_type":'int',
                "column_def": {"width": 50,
                             'render':0,
                             'orderSequence':["desc","asc"]},
        },{
                "column_name":"PCLSE",
                "column_name_full": "Close price",
                "column_description":"실시간 테이블에서 전일 종가를 의미합니다.",
                "data_type":'int',
                "column_def": {"width": 50,
                             'render':0,
                             'orderSequence':["desc","asc"]},
        },{
                "column_name":"RCLSE",
                "column_name_full": "Close price",
                "column_description":"실시간 테이블에서, 현재 종가(가격)을 의미합니다.",
                "data_type":'int',
                "column_def": {"width": 50,
                             'render':0,
                             'orderSequence':["desc","asc"]},
        },{
                "column_name":"TV",
                "column_name_full": "Close price",
                "column_description":"5분봉 거래대금(억)",
                "data_type":'int',
                "column_def": {"width": 35,
                             'render':2,
                             'orderSequence':["desc","asc"]},
        }
]



table_column_specification_interval = [
        {
                "column_name":"P{X}",
                "column_childs": ["P0", "P1", "P5", "P20", "P60", "P120", "P240"],
                "column_name_full": "Calculated Profit ratio based on closing price {X} trading days ago",
                "column_description": "최근 {X}거래일이전 종가를 기준으로 계산된 당일 종가 수익률(또는 상승, 하락율)입니다",
                "data_type": 'float',
                "background_color_map":"profit_map",
                "column_def": {"width": 35,
                             'render':2,
                             'orderSequence':["desc","asc"]},

        },{
                "column_name": "I{X}",
                "column_childs": ["I1", "I5", "I20", "I60", "I120", "I240"],
                "column_name_full": "Net purchase number of shares per {X} trading days over shares in circulation by Institution",
                "column_description": "최근 {X}거래일간 <u><b>기관</b>의 순매수 주식수</u> 를 <u>해당종목의 유통주식수</u>로 나눈값입니다<br> 보통 하루에 유통주식수의 1% 이상을 매수/매도하는것은 큰 변동성을 의미합니다, ",
                "data_type": 'float',
                "background_color_map":"profit_map",
                "column_def": {"width": 35,
                             'render':2,
                             'orderSequence':["desc","asc"]},
        },{
                "column_name": "F{X}",
                "column_childs": ["F1", "F5", "F20", "F60", "F120", "F240"],
                "column_name_full": "Net purchase number of shares per {X} trading days over shares in circulation by Foreiner",
                "column_description": "최근 {X}거래일간 <u><b>외인</b>의 순매수 주식수</u> 를 <u>해당종목의 유통주식수</u>로 나눈값입니다<br> 보통 하루에 유통주식수의 1% 이상을 매수/매도하는것은 큰 변동성을 의미합니다, ",
                "data_type": 'float',
                "background_color_map":"profit_map",
                "column_def": {"width": 35,
                             'render':2,
                             'orderSequence':["desc","asc"]},
        },{
                "column_name": "PS{X}",
                "column_childs": ["PS1", "PS5", "PS20", "PS60", "PS120", "PS240"],
                "column_name_full": "Net purchase number of shares per {X} trading days over shares in circulation by Other Person",
                "column_description": "최근 {X}거래일간 <u><b>개인</b>의 순매수 주식수</u> 를 <u>해당종목의 유통주식수</u>로 나눈값입니다<br> 보통 하루에 유통주식수의 1% 이상을 매수/매도하는것은 큰 변동성을 의미합니다, ",
                "data_type": 'float',
                "background_color_map":"profit_map",
                "column_def": {"width": 35,
                             'render':2,
                             'orderSequence':["desc","asc"]},
        },{
                "column_name": "Y{X}",
                "column_childs": ["YG1", "YG5", "YG20", "YG60", "YG120", "YG240"],
                "column_name_full": "Net purchase number of shares per {X} trading days over shares in circulation by Yeon-gi-keum",
                "column_description": "최근 {X}거래일간 <u><b>연기금</b>의 순매수 주식수</u> 를 <u>해당종목의 유통주식수</u>로 나눈값입니다<br> 보통 하루에 유통주식수의 1% 이상을 매수/매도하는것은 큰 변동성을 의미합니다, ",
                "data_type": 'float',
                "background_color_map":"profit_map",
                "column_def": {"width": 35,
                             'render':2,
                             'orderSequence':["desc","asc"]},
        },{
                "column_name": "S{X}",
                "column_childs": ["S1", "S5", "S20", "S60", "S120", "S240"],
                "column_name_full": "Net purchase number of shares per {X} trading days over shares in circulation by Samo-fund",
                "column_description": "최근 {X}거래일간 <u><b>사모펀드</b>의 순매수 주식수</u> 를 <u>해당종목의 유통주식수</u>로 나눈값입니다<br> 보통 하루에 유통주식수의 1% 이상을 매수/매도하는것은 큰 변동성을 의미합니다, ",
                "data_type": 'float',
                "background_color_map":"profit_map",
                "column_def": {"width": 35,
                             'render':2,
                             'orderSequence':["desc","asc"]},
        },{
                "column_name": "T{X}",
                "column_childs": ["T1", "T5", "T20", "T60", "T120", "T240"],
                "column_name_full": "Net purchase number of shares per {X} trading days over shares in circulation by Investment trust",
                "column_description": "최근 {X}거래일간 <u><b>투자신탁</b>의 순매수 주식수</u> 를 <u>해당종목의 유통주식수</u>로 나눈값입니다<br> 보통 하루에 유통주식수의 1% 이상을 매수/매도하는것은 큰 변동성을 의미합니다, ",
                "data_type": 'float',
                "background_color_map":"profit_map",
                "column_def": {"width": 35,
                             'render':2,
                             'orderSequence':["desc","asc"]},
        },{
                "column_name": "FN{X}",
                "column_childs": ["FN1", "FN5", "FN20", "FN60", "FN120", "FN240"],
                "column_name_full": "Net purchase number of shares per {X} trading days over shares in circulation by institude",
                "column_description": "최근 {X}거래일간 <u><b>금융기관</b>의 순매수 주식수</u> 를 <u>해당종목의 유통주식수</u>로 나눈값입니다<br> 보통 하루에 유통주식수의 1% 이상을 매수/매도하는것은 큰 변동성을 의미합니다, ",
                "data_type": 'float',
                "background_color_map":"profit_map",
                "column_def": {"width": 35,
                             'render':2,
                             'orderSequence':["desc","asc"]},
        },{
                "column_name": "OC{X}",
                "column_childs": ["OC1", "OC5", "OC20", "OC60", "OC120", "OC240"],
                "column_name_full": "Net purchase number of shares per {X} trading days over shares in circulation by Other corporations",
                "column_description": "최근 {X}거래일간 <u><b>기타법인</b>의 순매수 주식수</u> 를 <u>해당종목의 유통주식수</u>로 나눈값입니다<br> 보통 하루에 유통주식수의 1% 이상을 매수/매도하는것은 큰 변동성을 의미합니다, ",
                "data_type": 'float',
                "background_color_map":"profit_map",
                "column_def": {"width": 35,
                             'render':2,
                             'orderSequence':["desc","asc"]},
        }
]

table_column_specification_ranking = [
        {
        "column_name":"PR",
        "column_name_full": "Person ranking",
        "column_description": "당 종목의 500거래일간 개인의 일일 순매수주식수를 내림차순으로 정렬 했을때의 순위입니다.",
        "data_type":"int",
        "background_color_map":"rank_map",
        "column_def": {"width": 30}

        },{
        "column_name":"IR",
        "column_name_full": "",
        "column_description": "당 종목의 500거래일간 기관의 일일 순매수주식수를 내림차순으로 정렬 했을때의 순위입니다.",
        "data_type":"int",
        "background_color_map":"rank_map",
        "column_def": {"width": 30}
        },{
        "column_name":"FR",
        "column_name_full": "",
        "column_description": "당 종목의 500거래일간 외인의 일일 순매수주식수를 내림차순으로 정렬 했을때의 순위입니다.",
        "data_type":"int",
        "background_color_map":"rank_map",
        "column_def": {"width": 30}
        },{
        "column_name":"YR",
        "column_name_full": "",
        "column_description": "당 종목의 500거래일간 연기금의 일일 순매수주식수를 내림차순으로 정렬 했을때의 순위입니다.",
        "data_type":"int",
        "background_color_map":"rank_map",
        "column_def": {"width": 30}
        },{
        "column_name":"SR",
        "column_name_full": "",
        "column_description": "당 종목의 500거래일간 사모펀드의 일일 순매수주식수를 내림차순으로 정렬 했을때의 순위입니다.",
        "data_type":"int",
        "background_color_map":"rank_map",
        "column_def": {"width": 30}
        },{
        "column_name":"FNR",
        "column_name_full": "",
        "column_description": "당 종목의 500거래일간 금융회사의 일일 순매수주식수를 내림차순으로 정렬 했을때의 순위입니다.",
        "data_type":"int",
        "background_color_map":"rank_map",
        "column_def": {"width": 30}
        },{
        "column_name":"TR",
        "column_name_full": "",
        "column_description": "당 종목의 500거래일간 투자신탁회사의 일일 순매수주식수를 내림차순으로 정렬 했을때의 순위입니다.",
        "data_type":"int",
        "background_color_map":"rank_map",
        "column_def": {"width": 30}
        },{
        "column_name":"OCR",
        "column_name_full": "",
        "column_description": "당 종목의 500거래일간 기타법읜의 일일 순매수주식수를 내림차순으로 정렬 했을때의 순위입니다.",
        "data_type":"int",
        "background_color_map":"rank_map",
        "column_def": {"width": 30}
        }
]

table_column_specification_finan = [
        {
        "column_name":"PER",
        "column_name_full": "calculated PER",
        "column_description": "연환산(최근 4분기) PER값을 의미합니다, 보다 자세한 재무데이터는 종목명을 클릭하여 확인하실 수 있습니다.",
        "data_type": 'int',
        "background_color_map": "per_map",
        "column_def": {"width": 35,
                       'render':2,
                       'orderSequence':["desc","asc"]}
        }

        , {
        "column_name": "PBR",
        "column_name_full": "calculated PBR",
        "column_description": "연환산(최근 4분기) PBR값을 의미합니다, 보다 자세한 재무데이터는 종목명을 클릭하여 확인하실 수 있습니다.",
        "data_type": 'int',
        "background_color_map": "pbr_map",
        "column_def": {"width": 35,
                       'render':2,
                       'orderSequence':["desc","asc"]}
        }

        , {
        "column_name": "ROE",
        "column_name_full": "ROE",
        "column_description": "최근분기의 ROE값 입니다, 보다 자세한 재무데이터는 종목명을 클릭하여 확인하실 수 있습니다.",
        "data_type": 'int',
        "background_color_map": "roe_map",
        "column_def": {"width": 35,
                       'render':2,
                       'orderSequence':["desc","asc"]}
        }

]

table_column_specification_bollinger_band = [

        {
                "column_name": "PATTERN",
                "column_name_full": "Bollinger Bands Event,  Upward Breakthrough of The Bollinger Band's medium band (20 moving average line)",
                "column_description": '''
                종가선이 볼린저밴드와 교차하는 경우를 총 6가지 경우로 나타낼 수 있습니다.<br>
                최근 60거래일안에 일어난, 최근 4개 교차 이벤트를 이어서PATTERN 컬럼으로 구성하고 있습니다.<br>
                볼린저밴드는 상단밴드(Upper band), 중앙밴드(Medium band), 하단밴드(Lower band)로 구분하고<br>
                교차방향에 따라서 상향(Upward), 하향(Downward)인지로 구분합니다<br>
                따라서 이벤트는 UU, UD, MU, MD, LU, LD, 총 여섯가지 경우로 구성됩니다<br><br>
                
                <u>EXAMPLE</u><br>
                UU:  종가선이 볼린저밴드 상단밴드를 상향 돌파<br>
                UD:  종가선이 볼린저밴드 상단밴드를 하향 돌파<br>
                MU:  종가선이 볼린저밴드 중앙밴드(20일 이동평균선)를 상향 돌파<br>
                MD:  종가선이 볼린저밴드 상단밴드(20일 이동평균선)를 하향 돌파<br>
                LU:  종가선이 볼린저밴드 하단밴드를 상향 돌파<br>
                LD:  종가선이 볼린저밴드 하단밴드를 하향 돌파<br><br>
                
                <u>PATTERN 컬럼을 설명하는 추가정보컬럼들:</u><br>
                L{X}ED: 최근X번째 패턴의 발생시점이 당일부터 몇거래일 이전에 발생하였는지를 나타내는 값 (elapesed days)<br>
                L{X}BW: 최근X번째 패턴 발생당시 볼린저밴드의 폯<br>
                L{X}BP: 최근X번째 패턴 발생당시 볼린저밴드상의 위치를 BP (band position)<br>으로 별도컬럼으로 나타내고 있습니다<br>
                최근으로 부터 가장 가까운 이벤트를 L1, 가장 먼 이벤트를 L4를 추가정보 컬럼 접두사로 붙이고 있습니다.<br><br>
                
                <u>COMMENT #1</u><br>
                
                재즈스탁에서 매일매일 정렬된 수급데이터 테이블에서는 이미 오를대로 오른 종목이 눈에 띄기 쉽상인데<br>
                본 컬럼을 사용하면, 즉 전 종목테이블에서 Pattern 검색을 하면 저변동성 구간의 종목을 발굴해낼 수 있습니다<br>
                개인적으로는 <u>볼린저밴드 하단을 상향돌파하고 올라와서, 중앙을 뚫고 올라가다가 다시 뚫고 내려가서, 다시한번 중앙밴드를 뚫고 올라오는 패턴 => LUMUMDMU를 가장 좋아합니다</u><br><br>
                
                
                <u>COMMENT #2</u><br>
                LXED가 어느정도 간격을 두고 있으며, BW값이 0.1 보다 클수록 PATTERN이 가지는 의미가 더더욱 강해집니다.<br><br>
                
                <u>COMMENT #3</u><br>
                BW값이 0.1 보다 작으면 변동성이 극히 줄어들었음을 의미합니다. (거래량 없는 우선주, 스팩주, 소외주 등)<br><br>
                
                ''',

                "data_type": 'str',
                "column_def": {"width": 80}
        }, {
        "column_name": "L{X}ED",
        "column_childs": ["L4ED","L3ED","L2ED","L1ED"],
        "column_name_full": "ROE",
        "column_description": "최근X번째 볼린저밴드 이벤트가 몇 거래일이전에 발생하였는지를 나타내는 컬럼",
        "data_type": 'int',
        "column_def": {"width": 30,
                       'render':0,} # 자릿수인듯...

        }, {
        "column_name": "L{X}BP",
        "column_childs": ["L4BP","L3BP","L2BP","L1BP"],
        "column_name_full": "ROE",
        "column_description": "최근X번째 볼린저밴드 이벤트 발생당시 BBP",
        "data_type": 'int',
        "background_color_map":"bbp_map",
        "column_def": {"width": 30,
                       'render':2,}

        }, {
        "column_name": "L{X}BW",
        "column_childs": ["L4BW","L3BW","L2BW","L1BW"],
        "column_name_full": "ROE",
        "column_description": "최근X번째 볼린저밴드 이벤트 발생당시 BBW",
        "data_type": 'int',
        "background_color_map":"bbw_map",
        "column_def": {"width": 30,
                       'render':2,}

        }
]
table_column_specification_moving_average_ratio =[
        {
        "column_name": "PMA{X}",
        "column_childs": ["PMA5","PMA20","PMA60","PMA120","D_PMA5","D_PMA20","D_PMA60","D_PMA120"],
        "column_name_full": "ROE",
        "column_description": "(최근거래일주가 - X거래일 이동평균주가) / X거래일 이동평균주가",
        "data_type": 'int',
        "background_color_map":"profit_map",
        "column_def": {"width": 35,
                       'render':2,}

        },
        {
        "column_name": "VMA{X}",
        "column_childs": ["VMA5","VMA20","VMA60","VMA120","D_VMA5","D_VMA20","D_VMA60","D_VMA120"],
        "column_name_full": "ROE",
        "column_description": "(최근거래일거래량 - X거래일 이동평균거래량) / X거래일 이동평균거래량",
        "data_type": 'int',
        "background_color_map":"vma_map",
        "column_def": {"width": 35,
                       'render':2,}

        }


]

table_column_specification_other = [

        {
        "column_name": "CATEGORY",
        "column_name_full": "ROE",
        "column_description": "해당종목이 속한 카테고리(섹터)",
        "data_type": 'int',
       	"column_def": {"width": 140}

        },
        {
        "column_name": "FAV_DATE",
        "column_name_full": "ROE",
        "column_description": "즐겨찾기에 등록된 일자.",
        "data_type": 'int',
        "column_def": {"width": 70}

        }
]




table_column_specification_report = [

        {
        "column_name": "RTITLE",
        "column_name_full": "RTITLE",
        "column_description": "가장 최근에 발행된 증권사레포트 제목",
        "data_type": 'str',
        "column_def": {"width": 400}

        },{
        "column_name": "RC1M",
        "column_name_full": "ROE",
        "column_description": "REPORTS COUNT 1MONTH: 최근 20거래일간 발행된 레포트수",
        "data_type": 'int',
        "column_def": {"width": 35, "render":0}

        },{
        "column_name": "RC2M",
        "column_name_full": "ROE",
        "column_description": "REPORTS COUNT 2MONTH: 20거래일전 ~ 40거래일전 기간동안 발행된 레포트수",
        "data_type": 'int',
        "column_def": {"width": 35, "render":0}

        },{
        "column_name": "RDATE",
        "column_name_full": "ROE",
        "column_description": "가장 최근에 발행된 증권사레포트 발행일자",
        "data_type": 'int',
        "column_def": {"width": 60}

        },



]


table_column_specification_realtime = [

        {
        "column_name": "TIME",
        "column_childs": [ \
                '0900', '0905', '0910', '0915', '0920', '0925', '0930', '0935', '0940', '0945', '0950', '0955',
                '1000', '1005', '1010', '1015', '1020', '1025', '1030', '1035', '1040', '1045', '1050', '1055',
                '1100', '1105', '1110', '1115', '1120', '1125', '1130', '1135', '1140', '1145', '1150', '1155',
                '1200', '1205', '1210', '1215', '1220', '1225', '1230', '1235', '1240', '1245', '1250', '1255',
                '1300', '1305', '1310', '1315', '1320', '1325', '1330', '1335', '1340', '1345', '1350', '1355',
                '1400', '1405', '1410', '1415', '1420', '1425', '1430', '1435', '1440', '1445', '1450', '1455',
                '1500', '1505', '1510', '1515', '1530'],
        "column_name_full": "RTITLE",
        "column_description": "가장 최근에 발행된 증권사레포트 제목",
        "data_type": 'str',
        "column_def": {"width": 20, "render":1,
                       'orderSequence':["desc","asc"]}

        }
,

]
spec  = table_column_specification + \
        table_column_specification_interval +\
        table_column_specification_ranking +\
        table_column_specification_bollinger_band +\
        table_column_specification_moving_average_ratio +\
        table_column_specification_finan +\
        table_column_specification_report +\
        table_column_specification_realtime +\
        table_column_specification_other


if __name__=="__main__":

        print(spec)
