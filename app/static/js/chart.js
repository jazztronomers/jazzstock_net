let upColor = '#0008ff';
let downColor = '#ec0000';


function getOhlcChartData(stockcode){

    // 개별종목 챠트용 데이터를 받아오는 함수

    let req = new XMLHttpRequest()
    req.responseType = 'json';
    req.onreadystatechange = function()
    {
        if (req.readyState == 4)
        {
            if (req.status != 200)
            {
                console.log('hello')
            }
            else
            {


                ohlc_day_data = req.response.ohlc_day_data.result
                stockMap[stockcode]= ohlc_day_data

                if (window.innerWidth < 800){
                    toggleTableAndStock()
                }

                queueRender()

            }
        }
    }

    req.open('POST', '/getTableForOhlcDay')
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    req.send('stockcode='+stockcode)

}

function renderOhlcChart(stockcode, ohlc_day_data, element_id){


    // 개별종목 챠트를 화면에 그리는 함수

    element = document.getElementById(element_id)
    element.value=stockcode


    element.setAttribute("ondblclick", "renderSummary('" + stockcode + "')")


    // element.setAttribute("onclick", "removeGridStockElement('"+element_id+"')")
    closebutton = document.createElement("button")
    closebutton.innerHTML="X"
    closebutton.setAttribute("class","closestock")
    closebutton.setAttribute("onclick", "removeGridStockElement('"+element_id+"')")


    height_unit = Math.round(canvas_height * 0.15 / 9)
    // console.log("renderOhlcChart...", stockcode, element_id)

    let charts = echarts.init(element);
    var labelFont = 'bold 12px Sans-serif';

    let dates = ohlc_day_data.DATE
    let data = []
    for (let i = 0; i<=dates.length-1; i++){
        data.push([ohlc_day_data.OPEN[i], ohlc_day_data.CLOSE[i], ohlc_day_data.LOW[i], ohlc_day_data.HIGH[i]])
    }
    let volumes = ohlc_day_data.VOLUME

    let dataMA5 = ohlc_day_data.MA_W
    let dataMA20 = ohlc_day_data.MA_M
    let dataMA60 = ohlc_day_data.MA_Q

    charts.clear()


    option = {
        animation: false,

        toolbox: {
            feature: {
                myTool2: {
                    show: true,
                    tooltip: false,
                    Title: 'Remove',
                    icon: 'image://static/images/icon_close.png',
                    onclick: function (){
                        removeGridStockElement(element_id)
                    }
                }
            }
        },
        title: {
            left: 'left',
            text: ohlc_day_data.STOCKNAME[0],
            textStyle:{
                    fontSize: height_unit,
                    fontWeight:'bold',
                    color:'#7A7A7A'
            }
        },
        xAxis: [{
            type: 'category',
            data: dates,
            boundaryGap : false,
            axisLine: { lineStyle: { color: '#777' } },
            axisLabel: {
                fontSize: 8,
                formatter: function (value) {
                    return echarts.format.formatTime('MM-dd', value);
                }
            },
            min: 'dataMin',
            max: 'dataMax',
            axisPointer: {
                show: false
            }
        }, {
            type: 'category',
            gridIndex: 1,
            data: dates,
            scale: true,
            boundaryGap : false,
            splitLine: {show: false},
            axisLabel: {show: false},
            axisTick: {show: false},
            axisLine: { lineStyle: { color: '#777' } },
            splitNumber: 20,
            min: 'dataMin',
            max: 'dataMax',
            axisPointer: {
                type: 'shadow',
                label: {show: false},
                triggerTooltip: true
            }
        }],
        yAxis: [{
            scale: true,
            splitNumber: 2,
            axisLine: { lineStyle: { color: '#777' } },
            splitLine: { show: true },
            axisTick: { show: false },
            axisLabel: {
                inside: false,
                formatter: '{value}\n',
                fontSize: 8
            }
        }, {
            scale: true,
            gridIndex: 1,
            splitNumber: 2,
            axisLabel: {show: false},
            axisLine: {show: false},
            axisTick: {show: false},
            splitLine: {show: false}
        }],
        grid: [{
            left: height_unit*3,
            right: height_unit*1.5,
            top: 0,
            height: height_unit * 8
        }, {
            left: height_unit*3,
            right: height_unit*1.5,
            top: height_unit * 6,
            height: height_unit * 2

        }],
        dataZoom: [{
            type: 'inside',
            xAxisIndex: [0, 1],
            start: 75,
            end: 100,
            top: 0,
            height: height_unit * 8
        }],
        series: [{
            name: 'Volume',
            type: 'bar',
            xAxisIndex: 1,
            yAxisIndex: 1,
            itemStyle: {
                color: '#7fbe9e'
            },
            emphasis: {
                itemStyle: {
                    color: '#140'
                }
            },
            data: volumes
        }, {
            type: 'candlestick',
            name: 'OHLC',
            data: data,
            itemStyle: {
                color: downColor,
                color0: upColor,
            }
        }, {
            name: 'MA5',
            type: 'line',
            data: dataMA5,
            color: '#E02DE5',
            smooth: true,
            showSymbol: false,
            lineStyle: {
                width: 1
            }
        }, {
            name: 'MA20',
            type: 'line',
            data: dataMA20,
            color: '#e8d01e',
            smooth: true,
            showSymbol: false,
            lineStyle: {
                width: 1
            }
        }, {
            name: 'MA60',
            type: 'line',
            data: dataMA60,
            color: '#459615',
            smooth: true,
            showSymbol: false,
            lineStyle: {
                width: 1
            }
        }]
    };
    charts.setOption(option);
}


function renderSummary(stockcode){


    grid_field_stock = document.getElementById("grid_field_stock")
    grid_field_summary = document.getElementById("grid_field_summary")



    if (device_type == "mobile"){
        grid_field_summary.style.display="block"
    }
    else{
        grid_field_summary.style.display="inline-block"
    }


    grid_field_stock.style.display="none"
    getSummaryData(stockcode) // include rendering inside

}


function getSummaryData(stockcode){

    // snd_day_data
    // finan_table

    // 개별종목 SUMMARY 데이터를 받아오는 함수

    let req = new XMLHttpRequest()
    req.responseType = 'json';
    req.onreadystatechange = function()
    {
        if (req.readyState == 4)
        {
            if (req.status != 200)
            {
                console.log('hello')
            }
            else
            {


                snd_day_data = req.response.snd_day_data.result
                finan_data = req.response.finan_data  // html
                // finan_table_column_list = req.response.column_list  // html
                renderSummaryChart(stockcode, stockMap[stockcode], snd_day_data, "grid_summary_chart_price")
                renderSummaryFinanChart(stockcode, finan_data, "grid_summary_chart_finan")

            }
        }
    }

    req.open('POST', '/getTableForSummary')
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    req.send('stockcode='+stockcode)

}


function renderSummaryChart(stockcode, ohlc_day_data, snd_day_data, element_id){

    // console.log("renderSummaryChart", element_id)

    function calculateCumSum(data) {
        var result = [];
        var now = 0
        for (var i = 0, len = data.length; i < len; i++) {

            now = now + data[i]
            result.push(now);
        }
        return result;
    }
    // 개별종목 챠트를 화면에 그리는 함수

    element = document.getElementById(element_id)
    element.value=stockcode


    chart_height = canvas_height * 0.7
    element.style.height =  chart_height + 'px'
    element.style.position =  'relative'
    height_unit = Math.round(chart_height / 40)
    width_unit = canvas_height * 0.7 / 40


    let charts = echarts.init(element);
    var labelFont = 'bold 12px Sans-serif';

    let dates = ohlc_day_data.DATE
    let data = []
    for (let i = 0; i<=dates.length-1; i++){
        data.push([ohlc_day_data.OPEN[i], ohlc_day_data.CLOSE[i], ohlc_day_data.LOW[i], ohlc_day_data.HIGH[i]])
    }
    let volumes = ohlc_day_data.VOLUME

    let foreicumsum = calculateCumSum(snd_day_data.FOREI)
    let inscumsum = calculateCumSum(snd_day_data.INS)
    let percumsum = calculateCumSum(snd_day_data.PER)
    let ygcumsum = calculateCumSum(snd_day_data.YG)
    let samocumsum = calculateCumSum(snd_day_data.SAMO)


    let zero = new Array(ohlc_day_data.DATE.length).fill(0);

    let tusincumsum = calculateCumSum(snd_day_data.TUSIN)
    let financumsum = calculateCumSum(snd_day_data.FINAN)

    let othercorporcumsum = calculateCumSum(snd_day_data.OTHERCORPOR)
    let bankcumsum = calculateCumSum(snd_day_data.BANK)
    let insurcumsum = calculateCumSum(snd_day_data.INSUR)

    let mgcumsum = calculateCumSum(snd_day_data.MG)
    let gmcumsum = calculateCumSum(snd_day_data.GM)
    let cscumsum = calculateCumSum(snd_day_data.CS)
    let mrcumsum = calculateCumSum(snd_day_data.MR)
    let mqcumsum = calculateCumSum(snd_day_data.MQ)

    let clcumsum = calculateCumSum(snd_day_data.CL)
    let ubcumsum = calculateCumSum(snd_day_data.UB)
    let nmcumsum = calculateCumSum(snd_day_data.NM)
    let dccumsum = calculateCumSum(snd_day_data.DC)
    let dwcumsum = calculateCumSum(snd_day_data.DW)

    let jpcumsum = calculateCumSum(snd_day_data.JP)
    let sycumsum = calculateCumSum(snd_day_data.SY)
    let htcumsum = calculateCumSum(snd_day_data.HT)
    let ctcumsum = calculateCumSum(snd_day_data.CT)


    let dataMA5 = ohlc_day_data.MA_W
    let dataMA20 = ohlc_day_data.MA_M
    let dataMA60 = ohlc_day_data.MA_Q
    let dataMA120 = ohlc_day_data.MA_HY

    charts.clear()


    option = {
        animation: false,
        toolbox: {
            feature: {
                myTool2: {
                    show: true,
                    tooltip: false,
                    Title: 'Remove',
                    icon: 'image://static/images/icon_close.png',
                    onclick: function (){
                        removeGridStockElement(element_id)
                    }
                }
            }
        },
        title: {
            left: 'center',
            text: ohlc_day_data.STOCKNAME[0] + " (" + ohlc_day_data.STOCKCODE[1] + ")",
            textStyle:{
                    fontSize: height_unit,
                    fontWeight:'bold',
                    color:'#7A7A7A'
            }
        },
        tooltip: {

            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            },
            backgroundColor: 'rgba(245, 245, 245, 0.6)',
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 2,
            textStyle: {
                fontSize: 10,
                color: '#000'
            },
            position: function (pos, params, el, elRect, size) {
                var obj = {top: 10};
                obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
                return obj;
            }
        },
        axisPointer: {
            link: {xAxisIndex: 'all'},

            label: {
                show:false,
                backgroundColor: '#777'
            }
        },
        xAxis: [{
            // PRICE GRID 의 X축 관련 설정값들
            type: 'category',
            data: dates,
            scale: true,

            boundaryGap : false,
            // splitNumber: 8,
            // splitLine: {show: true},

            axisTick: {show: true},
            axisLine: { lineStyle: { color: '#777' } },
            axisTick: {show: true},
            axisLabel: {show: false},
            axisPointer: {
                type: 'shadow',
                label: {show: false},
                triggerTooltip: true
            },

            min: 'dataMin',
            max: 'dataMax'
        }, {

            // VOLUME GRID 의 X축 관련 설정값들
            // type: 'category',
            gridIndex: 1,
            data: dates,
            scale: true,

            boundaryGap : false,
            // splitNumber: 8,
            // splitLine: {show: false},

            axisTick: {show: true},
            axisLine: { lineStyle: { color: '#777' } },
            axisLabel: {show: false},
            axisPointer: {
                type: 'shadow',
                label: {show: false},
                triggerTooltip: true
            },

            min: 'dataMin',
            max: 'dataMax'
        }, {


            // SND GRID 의 X축 관련 설정값들
            // type: 'category',
            gridIndex: 2,
            data: dates,
            scale: true,

            boundaryGap : false,
            // splitNumber: 8,
            // splitLine: {show: true},

            axisTick: {show: true},
            axisLine: {
                lineStyle: { color: '#777' },
                onZero: false
            },
            axisLabel: {
                fontSize: 8,
                formatter: function (value) {
                    return echarts.format.formatTime('MM-dd', value);
                }
            },
            axisPointer: {
                type: 'shadow',
                label: {show: false},
                triggerTooltip: true
            },
            min: 'dataMin',
            max: 'dataMax'
        }
        ],
        yAxis: [{

            // PRICE GRID
            scale: true,
            boundaryGap : false,
            gridIndex: 0,
            splitLine: { show: true },
            axisLine: { lineStyle: { color: '#777' } },
            axisTick: {show: true},
            axisLabel: {
                inside: false,
                formatter: '{value}\n',
                fontSize: 8
            }
        }, {

            // VOLUME GRID
            scale: true,
            boundaryGap : false,
            gridIndex: 1,
            splitNumber: 2,
            axisLabel: {
                inside: false,
                formatter: '{value}\n',
                fontSize: 8
            },
            axisLine: { lineStyle: { color: '#777' } },
            axisTick: {show: true},
            splitLine: { show: true },
        }, {

            // SND CUMSUM GRID
            scale: true,
            boundaryGap : false,
            gridIndex: 2,
            splitNumber: 2,
            axisLabel: {
                inside: false,
                formatter: '{value}\n',
                fontSize: 8
            },
            axisLine: { lineStyle: { color: '#777' } },
            axisTick: {show: true},
            splitLine: { show: true }
        }],
        grid: [
        {
            // PRICE GRID  18
            left: width_unit*3,
            right: width_unit*1.5,
            top: height_unit*2,
            height: height_unit * 18,
            borderColor:'#D6D6D6',
            show: true
        }, {
            // VOLUME GRID 3
            left: width_unit*3,
            right: width_unit*1.5,
            top: height_unit * 21,
            height: height_unit * 3,
            borderColor:'#D6D6D6',
            show: true
        }, {
            // SND CUMSUM GRID
            left: width_unit*3,
            right: width_unit*1.5,
            top: height_unit * 25,
            height: height_unit * 12,
            borderColor:'#D6D6D6',
            show: true
        }],
        legend: {

            left: width_unit*3,
            right: width_unit*1.5,
            top: height_unit * 38,
            height: height_unit * 4,
            borderColor:'#D6D6D6',
            show: true,
            align:'center',
            itemgap: height_unit*5,
            itemwidth: height_unit*2,
            itemheight: height_unit*2,
            textStyle:{
                fontSize: height_unit*0.5,
                fontWeight:'bold'
            },
            selected:{

            '기관':true,
            '외인':true,
            '개인':true,
            '사모':false,
            '연기금':false,
            '투신':false,
            '금융':false,

            '기타법인':false,
            '은행':false,
            '보험':false,

            '모건':false,
            '골드만':false,
            'CS':false,
            '메릴':false,
            '맥쿼리':false,
            'CLSA':false,
            'UBS':false,
            '노무라':false,
            '도이치':false,
            '다이와':false,

            '한투':false,
            '신영':false,
            '제이피':false,
            '씨티':false,

            },
//            data: ['기관','외인','개인','사모','연기금',''
//                   ,'투신','금융','은행','보험','기타법인',''
//                   ,'모건','골드만','CS','메릴','CLSA',''
//                   ,'맥쿼리','UBS','도이치','노무라','다이와',''
//                   ,'제이피','씨티','한투','신영']
//

            data: ['기관','외인','개인','사모','연기금'
                   ,'투신','금융','은행','보험','기타법인'
                   ,'모건','골드만','CS','메릴','CLSA'
                   ,'맥쿼리','UBS','도이치','노무라','다이와'
                   ,'제이피','씨티','한투','신영']
        },
        dataZoom: [{
            type: 'inside',
            xAxisIndex: [0, 1, 2],
            start: 50,
            end: 100,
            top: 0,
            height: height_unit * 36
        }],


        series: [

        {
            type: 'candlestick',
            name: 'Candle',
            data: data,
            xAxisIndex: 0,
            yAxisIndex: 0,
            itemStyle: {
                color: downColor,
                color0: upColor,
            }
        }, {
            name: 'MA5',
            type: 'line',
            data: dataMA5,
            color: '#E02DE5',
            smooth: true,
            showSymbol: false,
            lineStyle: {
                width: 1
            }
        }, {
            name: 'MA20',
            type: 'line',
            data: dataMA20,
            color: '#e8d01e',
            smooth: true,
            showSymbol: false,
            lineStyle: {
                width: 1
            }
        }, {
            name: 'MA60',
            type: 'line',
            data: dataMA60,
            color: '#459615',
            smooth: true,
            showSymbol: false,
            lineStyle: {
                width: 1
            }
        }, {
            name: 'MA120',
            type: 'line',
            data: dataMA120,
            color: '#545454',
            smooth: true,
            showSymbol: false,
            lineStyle: {
                width: 1
            }
        }, {
            name: 'Volume',
            type: 'bar',
            xAxisIndex: 1,
            yAxisIndex: 1,
            itemStyle: {
                color: '#7fbe9e'
            },
            emphasis: {
                itemStyle: {
                    color: '#140'
                }
            },
            data: volumes
        }, {
            name: '기관',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 2, // Index 를 맞춰줘야 함
            yAxisIndex: 2, // Index 를 맞춰줘야 함
            data: inscumsum,
            lineStyle: {
                type:'dashed'
            }
        }, {
            name: '외인',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 2, // Index 를 맞춰줘야 함
            yAxisIndex: 2, // Index 를 맞춰줘야 함
            data: foreicumsum,
            lineStyle: {
                type:'dashed'
            }
        },{
            name: '개인',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 2, // Index 를 맞춰줘야 함
            yAxisIndex: 2, // Index 를 맞춰줘야 함
            data: percumsum,
            lineStyle: {
                type:'dashed'
            }
        },{
            name: '연기금',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 2, // Index 를 맞춰줘야 함
            yAxisIndex: 2, // Index 를 맞춰줘야 함
            data: ygcumsum,
            lineStyle: {
                type:'dashed'
            }
        },{
            name: '사모',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 2, // Index 를 맞춰줘야 함
            yAxisIndex: 2, // Index 를 맞춰줘야 함
            data: samocumsum,
            lineStyle: {
                type:'dashed'
            }
        },
        {
            name: '투신',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 2, // Index 를 맞춰줘야 함
            yAxisIndex: 2, // Index 를 맞춰줘야 함
            data: tusincumsum,
            lineStyle: {
                type:'dashed'
            },
        } ,
        {
            name: '금융',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 2, // Index 를 맞춰줘야 함
            yAxisIndex: 2, // Index 를 맞춰줘야 함
            data: financumsum,
            lineStyle: {
                type:'dashed'
            }
        },

        {
            name: '기타법인',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 2, // Index 를 맞춰줘야 함
            yAxisIndex: 2, // Index 를 맞춰줘야 함
            data: othercorporcumsum,
            lineStyle: {
                type:'dashed'
            },
        } ,
        {
            name: '보험',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 2, // Index 를 맞춰줘야 함
            yAxisIndex: 2, // Index 를 맞춰줘야 함
            data: insurcumsum,
            lineStyle: {
                type:'dashed'
            },
        } ,
        {
            name: '은행',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 2, // Index 를 맞춰줘야 함
            yAxisIndex: 2, // Index 를 맞춰줘야 함
            data: bankcumsum,
            lineStyle: {
                type:'dashed'
            },
        } ,
            , {
            name: '모건',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 2, // Index 를 맞춰줘야 함
            yAxisIndex: 2, // Index 를 맞춰줘야 함
            data: mgcumsum,
            lineStyle: {
                type:'dashed'
            }
        }    , {
            name: '골드만',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 2, // Index 를 맞춰줘야 함
            yAxisIndex: 2, // Index 를 맞춰줘야 함
            data: gmcumsum,
            lineStyle: {
                type:'dashed'
            }
        }    , {
            name: 'CS',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 2, // Index 를 맞춰줘야 함
            yAxisIndex: 2, // Index 를 맞춰줘야 함
            data: cscumsum,
            lineStyle: {
                type:'dashed'
            }
        }    , {
            name: '메릴',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 2, // Index 를 맞춰줘야 함
            yAxisIndex: 2, // Index 를 맞춰줘야 함
            data: mrcumsum,
            lineStyle: {
                type:'dashed'
            }
        }    , {
            name: '맥쿼리',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 2, // Index 를 맞춰줘야 함
            yAxisIndex: 2, // Index 를 맞춰줘야 함
            data: mqcumsum,
            lineStyle: {
                type:'dashed'
            }
        }    , {
            name: 'CLSA',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 2, // Index 를 맞춰줘야 함
            yAxisIndex: 2, // Index 를 맞춰줘야 함
            data: clcumsum,
            lineStyle: {
                type:'dashed'
            }
        }    , {
            name: 'UBS',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 2, // Index 를 맞춰줘야 함
            yAxisIndex: 2, // Index 를 맞춰줘야 함
            data: ubcumsum,
            lineStyle: {
                type:'dashed'
            }
        }    , {
            name: '노무라',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 2, // Index 를 맞춰줘야 함
            yAxisIndex: 2, // Index 를 맞춰줘야 함
            data: nmcumsum,
            lineStyle: {
                type:'dashed'
            }
        }, {
            name: '도이치',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 2, // Index 를 맞춰줘야 함
            yAxisIndex: 2, // Index 를 맞춰줘야 함
            data: dccumsum,
            lineStyle: {
                type:'dashed'
            }
        }, {
            name: '다이와',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 2, // Index 를 맞춰줘야 함
            yAxisIndex: 2, // Index 를 맞춰줘야 함
            data: dwcumsum,
            lineStyle: {
                type:'dashed'
            }
        }, {
            name: '제이피',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 2, // Index 를 맞춰줘야 함
            yAxisIndex: 2, // Index 를 맞춰줘야 함
            data: jpcumsum,
            lineStyle: {
                type:'dashed'
            }
        }, {
            name: '씨티',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 2, // Index 를 맞춰줘야 함
            yAxisIndex: 2, // Index 를 맞춰줘야 함
            data: ctcumsum,
            lineStyle: {
                type:'dashed'
            }
        }, {
            name: '신영',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 2, // Index 를 맞춰줘야 함
            yAxisIndex: 2, // Index 를 맞춰줘야 함
            data: sycumsum,
            lineStyle: {
                type:'dashed'
            }
        }, {
            name: '한투',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 2, // Index 를 맞춰줘야 함
            yAxisIndex: 2, // Index 를 맞춰줘야 함
            data: htcumsum,
            lineStyle: {
                type:'dashed'
            }
        },{
        data: zero,
        xAxisIndex: 2, // Index 를 맞춰줘야 함
        yAxisIndex: 2, // Index 를 맞춰줘야 함
        type:'line',
        showSymbol: false,
        lineStyle: {
            width: 1,
            type:'dotted',
            color:'grey'
        }
    }
]
    };
    charts.setOption(option);
}




function renderSummaryFinanChart(stockcode, finan_data, element_id){


    element = document.getElementById(element_id)
    element.value=stockcode

    chart_height = canvas_height * 0.25
    element.style.height =  chart_height + 'px'
    element.style.position =  'relative'
    height_unit = Math.round(chart_height / 22)
    width_unit = canvas_height * 0.7 / 40


    // console.log("renderSummaryChart...", stockcode, element_id)
    // console.log(ohlc_day_data)

    let charts = echarts.init(element);

    charts.clear()
    var labelFont = 'bold 12px Sans-serif';

    let dates = finan_data.DATE
    let per = finan_data.PER
    let pbr = finan_data.PBR
    let roe = finan_data.ROE
    let npr = finan_data.NPR
    let opr = finan_data.OPR
    let zero = new Array(finan_data.DATE.length).fill(0);

    option = {


    animation: false,
    grid: [{
            // PER  18
            left: width_unit*3,
            right: width_unit*1.5,
            top: height_unit*1,
            height: height_unit * 4,
            borderColor:'#D6D6D6',
            show: true
        }, {
            // PBR
            left: width_unit*3,
            right: width_unit*1.5,
            top: height_unit*5,
            height: height_unit * 4,
            borderColor:'#D6D6D6',
            show: true
        }, {
            // ROE
            left: width_unit*3,
            right: width_unit*1.5,
            top: height_unit*9,
            height: height_unit * 4,
            borderColor:'#D6D6D6',
            show: true
        }, {
            // NPR
            left: width_unit*3,
            right: width_unit*1.5,
            top: height_unit*13,
            height: height_unit * 4,
            borderColor:'#D6D6D6',
            show: true
        }, {
            // OPR
            left: width_unit*3,
            right: width_unit*1.5,
            top: height_unit*17,
            height: height_unit * 4,
            borderColor:'#D6D6D6',
            show: true
        }
    ],
    xAxis: [ {
            // PRICE GRID 의 X축 관련 설정값들
            type: 'category',
            data: dates,
            scale: true,

            boundaryGap : false,
            axisLine: { show:false },
            axisTick: { show:false },
            axisLabel: { show:false },
            axisPointer: {
                type: 'shadow',
                label: {show: false},
                triggerTooltip: true
            },

            min: 'dataMin',
            max: 'dataMax'
        },{
            // PRICE GRID 의 X축 관련 설정값들
            type: 'category',
            gridIndex: 1,
            data: dates,
            scale: true,

            boundaryGap : false,
            axisLine: { show:false },
            axisTick: { show:false },
            axisLabel: { show:false },
            axisPointer: {
                type: 'shadow',
                label: {show: false},
                triggerTooltip: true
            },

            min: 'dataMin',
            max: 'dataMax'
        },{
            // PRICE GRID 의 X축 관련 설정값들
            type: 'category',
            gridIndex: 2,
            data: dates,
            scale: true,

            boundaryGap : false,
            axisLine: { show:false },
            axisTick: { show:false },
            axisLabel: { show:false },
            axisPointer: {
                type: 'shadow',
                label: {show: false},
                triggerTooltip: true
            },

            min: 'dataMin',
            max: 'dataMax'
        },{
            // PRICE GRID 의 X축 관련 설정값들
            type: 'category',

            gridIndex: 3,
            data: dates,
            scale: true,

            boundaryGap : false,
            axisLine: { show:false },
            axisTick: { show:false },
            axisLabel: { show:false },
            axisPointer: {
                type: 'shadow',
                label: {show: false},
                triggerTooltip: true
            },

            min: 'dataMin',
            max: 'dataMax'
        },{
            gridIndex: 4,
            data: dates,
            scale: true,

            boundaryGap : false,
            axisTick: {show: true},
            axisLine: {
                lineStyle: { color: '#777' },
                onZero: false
            },
            axisLabel: {
                fontSize: 8,
            },
            axisPointer: {
                type: 'shadow',
                label: {show: false},
                triggerTooltip: true
            },
            min: 'dataMin',
            max: 'dataMax'
        }
    ],
    yAxis: [{
            name:"PER",
            nameLocation:"center",
            scale: true,
            boundaryGap : true,
            gridIndex: 0,
            splitLine: { show: false },
            axisLine: { show:false },
            axisTick: { show:false },
            axisLabel: { show:false },

        }, {

            name:"PBR",
            nameLocation:"center",
            scale: true,
            boundaryGap : true,
            gridIndex: 1,
            splitLine: { show: false },
            axisLine: { show:false },
            axisTick: { show:false },
            axisLabel: { show:false },
        }, {
            name:"ROE",
            nameLocation:"center",
            scale: true,
            boundaryGap : true,
            gridIndex: 2,
            splitLine: { show: false },
            axisLine: { show:false },
            axisTick: { show:false },
            axisLabel: { show:false },
        }, {
            name:"NPR",
            nameLocation:"center",
            scale: true,
            boundaryGap : true,
            gridIndex: 3,
            splitLine: { show: false },
            axisLine: { show:false },
            axisTick: { show:false },
            axisLabel: { show:false },
        }, {

            name:"OPR",
            nameLocation:"center",
            scale: true,
            boundaryGap : true,
            gridIndex: 4,
            splitLine: { show: false },
            axisLine: { show:false },
            axisTick: { show:false },
            axisLabel: { show:false },
    }],

    series: [{
        data: per,
        name: 'PER',
        type: 'line'
    },{
        data: pbr,
        name: 'PBR',
        xAxisIndex: 1, // Index 를 맞춰줘야 함
        yAxisIndex: 1, // Index 를 맞춰줘야 함
        type: 'line'
    },{
        data: roe,
        name: 'ROE',
        xAxisIndex: 2, // Index 를 맞춰줘야 함
        yAxisIndex: 2, // Index 를 맞춰줘야 함
        type: 'line'
    },{
        data: npr,
        name: 'NPR',
        xAxisIndex: 3, // Index 를 맞춰줘야 함
        yAxisIndex: 3, // Index 를 맞춰줘야 함
        type: 'line'
    },{
        data: opr,
        name: 'OPR',
        xAxisIndex: 4, // Index 를 맞춰줘야 함
        yAxisIndex: 4, // Index 를 맞춰줘야 함
        type: 'line'
    },{
        data: zero,
        type:'line',
        showSymbol: false,
        lineStyle: {
            width: 1,
            type:'dotted',
            color:'grey'
        }
    },{
        data: zero,
        xAxisIndex: 1, // Index 를 맞춰줘야 함
        yAxisIndex: 1, // Index 를 맞춰줘야 함
        type:'line',
        showSymbol: false,
        lineStyle: {
            width: 1,
            type:'dotted',
            color:'grey'
        }
    },{
        data: zero,
        xAxisIndex: 2, // Index 를 맞춰줘야 함
        yAxisIndex: 2, // Index 를 맞춰줘야 함
        type:'line',
        showSymbol: false,
        lineStyle: {
            width: 1,
            type:'dotted',
            color:'grey'
        }
    },{
        data: zero,
        xAxisIndex: 3, // Index 를 맞춰줘야 함
        yAxisIndex: 3, // Index 를 맞춰줘야 함
        type:'line',
        showSymbol: false,
        lineStyle: {
            width: 1,
            type:'dotted',
            color:'grey'
        }
    },{
        data: zero,
        xAxisIndex: 4, // Index 를 맞춰줘야 함
        yAxisIndex: 4, // Index 를 맞춰줘야 함
        type:'line',
        showSymbol: false,
        lineStyle: {
            width: 1,
            type:'dotted',
            color:'grey'
        }
    }],

    tooltip: {

            trigger: 'axis',
            backgroundColor: 'rgba(245, 245, 245, 0.6)',
            borderWidth: 1,
            borderColor: '#ccc',
            padding: 2,
            textStyle: {
                fontSize: 10,
                color: '#000'
            },
            position: function (pos, params, el, elRect, size) {
                var obj = {top: 10};
                obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
                return obj;
            },
            formatter: function (params) {
                let finanMap = {}
                for (let i = 0; i < params.length; i++){
                    finanMap[params[i].seriesName]=params[i].data
                }
                axisValue = params[0].axisValue
                ret = "<b><u>" + axisValue + "</u></b><br>"
                ret += " - PER: " + finanMap['PER'] + '<br>'
                ret += " - PBR: " + finanMap['PBR'] + '<br>'
                ret += " - ROE: " + finanMap['ROE'] + '<br>'
                ret += " - NPR: " + finanMap['NPR'] + '<br>'
                ret += " - OPR: " + finanMap['OPR'] + '<br>'
                return ret
              }
    },
    axisPointer: {
            type: 'cross',
            link: {xAxisIndex: 'all'},

            label: {
                show:false,
                backgroundColor: '#777'
            }
    },

//    tooltip: {
//
//            trigger: 'axis',
//            axisPointer: {
//                link: {xAxisIndex: 'all'},
//
//                type: 'cross',
//            },
////            formatter: function (params) {
////                            // return echarts.format.truncateText(name[0].axisValue, 40, '14px Microsoft Yahei', '…');
////
////                            console.log(params)
////                            return  "hello"
//////                            params[0].axisValue+'\n'+
//////                                    params[0].marker+params[0].seriesName+" : "+params[0].data+'\n'+
//////                                    params[1].marker+params[1].seriesName+" : "+params[1].data+'\n'+
//////                                    params[2].marker+params[2].seriesName+" : "+params[2].data+'\n'+
//////                                    params[3].marker+params[2].seriesName+" : "+params[3].data+'\n';
////                        },
//            backgroundColor: 'rgba(245, 245, 245, 0.6)',
//            borderWidth: 1,
//            borderColor: '#ccc',
//            padding: 2,
//            textStyle: {
//                fontSize: 10,
//                color: '#000'
//            },
//            position: function (pos, params, el, elRect, size) {
//                var obj = {top: 10};
//                obj[['left', 'right'][+(pos[0] < size.viewSize[0] / 2)]] = 30;
//                return obj;
//            },
//
//        },
    }

    charts.setOption(option);
};






//
//function renderSummaryFinanTable(stockcode, finan_table, column_list, element_id){
//
//    document.getElementById(element_id).innerHTML = finan_table
//    let ratio = 0.9
//    if (device_type == "mobile"){
//        ratio = 0.85
//        // alert(ratio)
//
//    }
//
//    console.log(column_list)
//    console.log(getColumnDefs(column_list))
//
//    // 서버사이드에서 받아온 HTML테이블객체를 DATATABLE형태로 INITIALIZE
//    $('#'+element_id).dataTable( {
//        aaSorting: [],
//        // stateSave:true,
//        sScrollX:"100%",
//        // scrollY: canvas_height * ratio +  'px',
//        autoWidth:false,
//        autoHeight:false,
//        aLengthMenu: [ 5 ],
//        iDisplayLength: 100,
//        // fixedHeader: true,
//        columnDefs: getColumnDefs(column_list),
//        scrollCollapse: true,
//        fixedColumns : {
//            leftColumns : 1
//        },
//
//
//        initComplete: function( settings, json ) {
//
//            // $("div.dataTables_scrollBody").animate({ scrollLeft: 400 }, 1000);
//            // $("div.dataTables_scrollBody").animate({ scrollLeft: 400 }, 100);
//
//        }
//
//
//
//    } );
//
//    $('#'+element_id).on('dblclick', 'td', function () {
//        var tr = $(this).closest('tr');
//        var row = table.row( tr );
//
//        if ($(tr).css('font-weight')==400){
//            $(tr).css('font-weight', 800)
//            $(tr).css('border-bottom','1.5pt')
//        }
//        else {
//            $(tr).css('font-weight', 400)
//            $(tr).css('border-bottom','1pt')
//
//        }
//    } );
//
//    console.log(' * Table rendering done', now())
//
//}
