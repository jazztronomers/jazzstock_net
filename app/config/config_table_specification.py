'''
TABLE SPECIFICATION을 CONFIGURABLE하게 파이썬 DICTIONARY 로 저장해두는 소스
향후 Client Side에서 본 Dictionary를 json object로 받아서
Conditional formatting 또는 tooltip을 띄울 수 있도록
'''



table_column_specification = [
        {
        "column_name":"STOCKNAME",
        "column_name_full":"STOCKNAME",
        "column_description":"종목명",
        "data_type":'str'
        },{
        "column_name":"MC",
        "column_name_full": "Market Capital",
        "column_description":'''
        Market Capital의 약자로, 당 종목의 시가총액(천억)을 의미하며, "당일 종가 x 발행주식수"로 매 거래일마다 계산됩니다.<br>
        일부 우선주의 경우 발행주식수 원천데이터가 잘못되어 시가총액이 높게 계산되고 있습니다, 양해 바랍니다.''',
        "data_type":'float'
        },{
        "column_name":"FAV",
        "column_name_full": "Favorite",
        "column_description":'''
        즐겨찾기 등록을 위한 체크박스입니다<br>
        즐겨찾기로 등록하고자 하는 종목 옆 체크박스를 체크후, 아래 <즐겨찾기 업데이트> 버튼을 클릭하시면<br>
        체크된 종목들이 즐겨찾기 종목으로 등록되며, 향후 모든테이블에서 노란색으로 Highlighting 됩니다<br>
        추가로 <즐겨찾기> 탭에서 별도로 모아서 조회할 수 있습니다.''',
        "data_type":"checkbox"
        },{
        "column_name":"CLOSE",
        "column_name_full": "Close price",
        "column_description":"당일종가를 의미합니다.",
        "data_type":'int'
        }
]



table_column_specification_interval = [
        {
        "column_name":"P{X}",
        "column_name_full": "Calculated Profit ratio based on closing price {X} trading days ago",
        "column_description": "최근 {X}거래일이전 종가를 기준으로 계산된 당일 종가 수익률(또는 상승, 하락율)입니다",
        "data_type": 'float'
        },{
        "column_name": "I{X}",
        "column_name_full": "Net purchase number of shares per {X} trading days over shares in circulation by Institution",
        "column_description": "최근 {X}거래일간 <u><b>기관</b>의 순매수 주식수</u> 를 <u>해당종목의 유통주식수</u>로 나눈값입니다<br> 보통 하루에 유통주식수의 1% 이상을 매수/매도하는것은 큰 변동성을 의미합니다, ",
        "data_type": 'float'
        },{
        "column_name": "F{X}",
        "column_name_full": "Net purchase number of shares per {X} trading days over shares in circulation by Foreiner",
        "column_description": "최근 {X}거래일간 <u><b>외인</b>의 순매수 주식수</u> 를 <u>해당종목의 유통주식수</u>로 나눈값입니다<br> 보통 하루에 유통주식수의 1% 이상을 매수/매도하는것은 큰 변동성을 의미합니다, ",
        "data_type": 'float'
        },{
        "column_name": "PS{X}",
        "column_name_full": "Net purchase number of shares per {X} trading days over shares in circulation by Other Person",
        "column_description": "최근 {X}거래일간 <u><b>개인</b>의 순매수 주식수</u> 를 <u>해당종목의 유통주식수</u>로 나눈값입니다<br> 보통 하루에 유통주식수의 1% 이상을 매수/매도하는것은 큰 변동성을 의미합니다, ",
        "data_type": 'float'
        },{
        "column_name": "Y{X}",
        "column_name_full": "Net purchase number of shares per {X} trading days over shares in circulation by Yeon-gi-keum",
        "column_description": "최근 {X}거래일간 <u><b>연기금</b>의 순매수 주식수</u> 를 <u>해당종목의 유통주식수</u>로 나눈값입니다<br> 보통 하루에 유통주식수의 1% 이상을 매수/매도하는것은 큰 변동성을 의미합니다, ",
        "data_type": 'float'
        },{
        "column_name": "S{X}",
        "column_name_full": "Net purchase number of shares per {X} trading days over shares in circulation by Samo-fund",
        "column_description": "최근 {X}거래일간 <u><b>사모펀드</b>의 순매수 주식수</u> 를 <u>해당종목의 유통주식수</u>로 나눈값입니다<br> 보통 하루에 유통주식수의 1% 이상을 매수/매도하는것은 큰 변동성을 의미합니다, ",
        "data_type": 'float'
        },{
        "column_name": "T{X}",
        "column_name_full": "Net purchase number of shares per {X} trading days over shares in circulation by Investment trust",
        "column_description": "최근 {X}거래일간 <u><b>투자신탁</b>의 순매수 주식수</u> 를 <u>해당종목의 유통주식수</u>로 나눈값입니다<br> 보통 하루에 유통주식수의 1% 이상을 매수/매도하는것은 큰 변동성을 의미합니다, ",
        "data_type": 'float'
        },{
        "column_name": "FN{X}",
        "column_name_full": "Net purchase number of shares per {X} trading days over shares in circulation by institude",
        "column_description": "최근 {X}거래일간 <u><b>금융기관</b>의 순매수 주식수</u> 를 <u>해당종목의 유통주식수</u>로 나눈값입니다<br> 보통 하루에 유통주식수의 1% 이상을 매수/매도하는것은 큰 변동성을 의미합니다, ",
        "data_type": 'float'
        },{
        "column_name": "OC{X}",
        "column_name_full": "Net purchase number of shares per {X} trading days over shares in circulation by Other corporations",
        "column_description": "최근 {X}거래일간 <u><b>기타법인</b>의 순매수 주식수</u> 를 <u>해당종목의 유통주식수</u>로 나눈값입니다<br> 보통 하루에 유통주식수의 1% 이상을 매수/매도하는것은 큰 변동성을 의미합니다, ",
        "data_type": 'float'
        }
]

table_column_specification_ranking = [
        {
        "column_name":"PR",
        "column_name_full": "Person ranking",
        "column_description": "당 종목의 500거래일간 개인의 일일 순매수주식수를 내림차순으로 정렬 했을때의 순위입니다.",
        "data_type":"int"
        },{
        "column_name":"IR",
        "column_name_full": "",
        "column_description": "당 종목의 500거래일간 기관의 일일 순매수주식수를 내림차순으로 정렬 했을때의 순위입니다.",
        "data_type":"int"
        },{
        "column_name":"FR",
        "column_name_full": "",
        "column_description": "당 종목의 500거래일간 외인의 일일 순매수주식수를 내림차순으로 정렬 했을때의 순위입니다.",
        "data_type":"int"
        },{
        "column_name":"YR",
        "column_name_full": "",
        "column_description": "당 종목의 500거래일간 연기금의 일일 순매수주식수를 내림차순으로 정렬 했을때의 순위입니다.",
        "data_type":"int"
        },{
        "column_name":"SR",
        "column_name_full": "",
        "column_description": "당 종목의 500거래일간 사모펀드의 일일 순매수주식수를 내림차순으로 정렬 했을때의 순위입니다.",
        "data_type":"int"
        },{
        "column_name":"FNR",
        "column_name_full": "",
        "column_description": "당 종목의 500거래일간 금융회사의 일일 순매수주식수를 내림차순으로 정렬 했을때의 순위입니다.",
        "data_type":"int"
        },{
        "column_name":"TR",
        "column_name_full": "",
        "column_description": "당 종목의 500거래일간 투자신탁회사의 일일 순매수주식수를 내림차순으로 정렬 했을때의 순위입니다.",
        "data_type":"int"
        },{
        "column_name":"OCR",
        "column_name_full": "",
        "column_description": "당 종목의 500거래일간 기타법읜의 일일 순매수주식수를 내림차순으로 정렬 했을때의 순위입니다.",
        "data_type":"int"
        }
]

table_column_specification_finan = [
        {
        "column_name":"cPER",
        "column_name_full": "calculated PER",
        "column_description": "연환산(최근 4분기) PER값을 의미합니다, 보다 자세한 재무데이터는 종목명을 클릭하여 확인하실 수 있습니다.",
        "data_type": 'int'
        }

        , {
        "column_name": "cPBR",
        "column_name_full": "calculated PBR",
        "column_description": "연환산(최근 4분기) PBR값을 의미합니다, 보다 자세한 재무데이터는 종목명을 클릭하여 확인하실 수 있습니다.",
        "data_type": 'int'
        }

        , {
        "column_name": "ROE",
        "column_name_full": "ROE",
        "column_description": "최근분기의 ROE값 입니다, 보다 자세한 재무데이터는 종목명을 클릭하여 확인하실 수 있습니다.",
        "data_type": 'int'
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

                "data_type": 'str'
        }
]



spec  = table_column_specification + \
        table_column_specification_interval +\
        table_column_specification_ranking +\
        table_column_specification_bollinger_band +\
        table_column_specification_finan