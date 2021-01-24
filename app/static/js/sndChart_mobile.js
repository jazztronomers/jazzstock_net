function search(data, flag, chartId) {


if(data.length ==0) {
    alert("해당 종목 데이터가 없습니다.");
    return;
}

function calculateMA(dayCount, data) {
    var result = [];
    for (var i = 0, len = data.length; i < len; i++) {
        if (i < dayCount) {
            result.push('-');
            continue;
        }
        var sum = 0;
        for (var j = 0; j < dayCount; j++) {
            sum += data[i - j][1];
        }
        result.push((sum / dayCount).toFixed(2));
    }
    return result;
}


function calculateCumSum(data) {
    var result = [];
    var now = 0
    for (var i = 0, len = data.length; i < len; i++) {

        now = now + data[i]
        result.push(now);
    }
    return result;
}

function separatePlusMinus(data) {
    var plus = [];
    var minus = [];

    for (var i = 0, len = data.length; i < len; i++) {


        if (data[i]>0) {
            plus.push(data[i])
            minus.push(0)
        }
        else{
            minus.push(data[i])
            plus.push(0)
        }
    }
    return {
        plus:plus,
        minus:minus
   };
}

var width = Math.min(document.body.clientWidth,800);

var data_array = new Array;
var volumes = new Array;
var shortbalance = new Array;

var dates = new Array;

var ins = new Array;
var forei = new Array;
var per = new Array;

var yg = new Array;
var samo = new Array;
var tusin = new Array;
var finan = new Array;

var othercorpor = new Array;
var bank = new Array;
var insur = new Array;

var mg = new Array;
var gm = new Array;
var cs = new Array;
var mr = new Array;
var mq = new Array;

var cl = new Array;
var ub = new Array;
var nm = new Array;
var dc = new Array;
var dw = new Array;

var jp = new Array;
var sy = new Array;
var ht = new Array;
var ct = new Array;



console.log(' * CHART RENDERING...' , data[0].STOCKCODE, data.length)
for(var i = 0; i <data.length; i++){

    data_array.push([data[i].OPEN, data[i].CLOSE, data[i].LOW, data[i].HIGH, data[i].VOLUME, data[i].DATE]);
    volumes.push(data[i].VOLUME);
    shortbalance.push(data[i].SBAL)
    dates.push(data[i].DATE);


    ins.push(data[i].INS);
    forei.push(data[i].FOREI);
    per.push(data[i].PER);

    yg.push(data[i].YG)
    samo.push(data[i].SAMO)
    tusin.push(data[i].TUSIN)
    finan.push(data[i].FINAN)

    othercorpor.push(data[i].OTHERCORPOR)
    bank.push(data[i].BANK)
    insur.push(data[i].INSUR)


    mg.push(data[i].MG)
    gm.push(data[i].GM)
    cs.push(data[i].CS)
    mr.push(data[i].MR)
    mq.push(data[i].MQ)

    cl.push(data[i].CL)
    ub.push(data[i].UB)
    nm.push(data[i].NM)
    dc.push(data[i].DC)
    dw.push(data[i].DW)

    jp.push(data[i].JP)
    sy.push(data[i].SY)
    ht.push(data[i].HT)
    ct.push(data[i].CT)

}

var inscumsum = calculateCumSum(ins)
var foreicumsum = calculateCumSum(forei)
var percumsum = calculateCumSum(per)

var ygcumsum = calculateCumSum(yg)
var samocumsum = calculateCumSum(samo)
var tusincumsum = calculateCumSum(tusin)
var financumsum = calculateCumSum(finan)

var othercorporcumsum = calculateCumSum(othercorpor)
var bankcumsum = calculateCumSum(bank)
var insurcumsum = calculateCumSum(insur)

var mgcumsum = calculateCumSum(mg)
var gmcumsum = calculateCumSum(gm)
var cscumsum = calculateCumSum(cs)
var mrcumsum = calculateCumSum(mr)
var mqcumsum = calculateCumSum(mq)

var clcumsum = calculateCumSum(cl)
var ubcumsum = calculateCumSum(ub)
var nmcumsum = calculateCumSum(nm)
var dccumsum = calculateCumSum(dc)
var dwcumsum = calculateCumSum(dw)

var jpcumsum = calculateCumSum(jp)
var sycumsum = calculateCumSum(sy)
var htcumsum = calculateCumSum(ht)
var ctcumsum = calculateCumSum(ct)


ins = separatePlusMinus(ins)
forei = separatePlusMinus(forei)
per = separatePlusMinus(per)
yg = separatePlusMinus(yg)
samo = separatePlusMinus(samo)
tusin = separatePlusMinus(tusin)
finan = separatePlusMinus(finan)


othercorpor = separatePlusMinus(othercorpor)
bank = separatePlusMinus(bank)
insur = separatePlusMinus(insur)

mg= separatePlusMinus(mg)
gm= separatePlusMinus(gm)
cs= separatePlusMinus(cs)
mr= separatePlusMinus(mr)
mq= separatePlusMinus(mq)
cl= separatePlusMinus(cl)
ub= separatePlusMinus(ub)
nm= separatePlusMinus(nm)
dc= separatePlusMinus(dc)
dw= separatePlusMinus(dw)

jp= separatePlusMinus(jp)
sy= separatePlusMinus(sy)
ht= separatePlusMinus(ht)
ct= separatePlusMinus(ct)


var dataMA5 = calculateMA(5, data_array);
var dataMA20 = calculateMA(20, data_array);
var dataMA60 = calculateMA(60, data_array);
var dataMA120 = calculateMA(120, data_array);

var labelFont = 'bold 12px Sans-serif';
var upColor = '#0008ff';
var downColor = '#ec0000';



var myChart = echarts.init(document.getElementById(chartId));



/*
그래프 추가 필요 항목
    grid, x-axis, y-axis, series 추가
    datazoom 영역도 공유하려면 datazoom 역시 추가 필요
*/

// 통합
    myChart.clear();
    myChart = echarts.init(document.getElementById(chartId));
    myChart.setOption({
        animation: false,

        title: {
            left: 'center',
            textStyle:{
                fontSize: 12,
                fontWeight:'bold'
            },
            text: data[0].STOCKNAME + '('  + data[0].STOCKCODE + ')'
        },
        legend: {
            top: width*0.9,
            left:'8%',
            align:'left',
            textStyle:{
                fontSize: 9,
                fontWeight:'bold'
            },
            selected:{

            '기관':true,
            '외인':true,
            '개인':false,
            '사모펀드':true,
            '연기금':true,
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
            data: ['기관','외인','개인',''
            ,'사모펀드','연기금','투신',''
            ,'금융','은행','보험','기타법인',''
            ,'모건','골드만','CS','메릴',''
            ,'맥쿼리','CLSA','UBS',''
            ,'노무라','도이치','다이와',''
            ,'제이피','씨티','한투','신영']
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
        brush: {
            xAxisIndex: 'all',
            brushLink: 'all',
            outOfBrush: {
                colorAlpha: 0.1
            }
        },
        grid: [
            {
                left: '8%',
                right: '12%',
                width: width*0.8,
                top: width*0.08,
                height: width*0.24,
                show: true
            },
            {
                left: '8%',
                right: '12%',
                width: width*0.8,
                top: width*0.32,
                height: width*0.06,
                show: true
            },{
                left: '8%',
                right: '12%',
                width: width*0.8,
                top: width*0.44,
                height: width*0.06,
                show: true
            }
            // Add graph Grid 위치 조정
            , {
                left: '8%',
                right: '12%',
                width: width*0.8,
                top: width*0.5,
                height: width*0.4,
                show: true
            }


            // Add graph Grid End
        ],
        xAxis: [
            {
                type: 'category',
                data: dates,
                scale: true,
                boundaryGap : false,
                axisLine: {onZero: true},
                axisTick: {show: false},
                splitLine: {show: true},
                axisLabel: {
                    show: false,
                    fontSize: 8,
                },
                splitNumber: 20,
                min: 'dataMin',
                max: 'dataMax',
                axisPointer: {
                    z: 100
                }
            },
            {
                type: 'category',

                nameLocation:"start",
                gridIndex: 1,
                data: dates,
                scale: true,
                boundaryGap : false,
                axisLine: {onZero: true},
                axisTick: {show: false},
                splitLine: {show: true},
                axisLabel: {
                    show: true,
                    fontSize: 8,
                },
                splitNumber: 20,
                min: 'dataMin',
                max: 'dataMax'
            }
            // Add graph Start x-Grid

            , {

                type: 'category',
                gridIndex: 2, // Index 를 맞춰줘야 함
                data: dates,
                scale: true,
                boundaryGap : false,
                axisLine: {onZero: true},
                axisTick: {show: false},
                splitLine: {show: true},
                axisLabel: {
                    show: false,
                    fontSize: 8,
                },
                splitNumber: 20,
                min: 'dataMin',
                max: 'dataMax'
            },

                        , {

                type: 'category',
                gridIndex: 3, // Index 를 맞춰줘야 함
                data: dates,
                scale: true,
                boundaryGap : false,
                axisLine: {onZero: true},
                axisTick: {show: false},
                splitLine: {show: true},
                axisLabel: {
                    show: false,
                    fontSize: 8,
                },
                splitNumber: 20,
                min: 'dataMin',
                max: 'dataMax'
            }

            // Add graph End x-Grid
        ],
        yAxis: [
            {
                scale: true,
                splitArea: {
                    show: true
                },
                position: 'left',
                axisLabel: {
                    show: true,
                    fontSize: 8,
                },

            }, {
                scale: true,
                position: 'right',
                gridIndex: 1,
                splitNumber: 2,
                axisLabel: {
                    show: true,
                    fontSize: 8,
                },
                axisLine: {show: false},
                axisTick: {show: false},
                splitLine: {show: false}
            }
            // Add graph Start y-Grid
            , {
                scale: true,
                position: 'right',
                gridIndex: 2, // Index 를 맞춰줘야 함
                splitNumber: 2,
                axisLabel: {
                    show: true,
                    fontSize: 8,
                },
                axisLine: {show: false},
                axisTick: {show: false},
                splitLine: {show: false}
            }

                        , {
                scale: true,
                position: 'right',
                gridIndex: 3, // Index 를 맞춰줘야 함
                splitNumber: 2,
                axisLabel: {
                    show: true,
                    fontSize: 8,
                },
                axisLine: {show: false},
                axisTick: {show: false},
                splitLine: {show: false}
            }




            // Add graph End y-Grid
        ],
        dataZoom: [
            {
                type: 'inside',
                // 그래프 추가 될 시 x-axis index 추가
                xAxisIndex: [0, 1, 2,3],
                start: 70,
                end: 100
            },
            {
                show: true,
                xAxisIndex: [0, 1],
                type: 'slider',

                width: width*0.8,
                left: '8%',
                right: '12%',
                top: width*0.05,
                height:width*0.03,
                start: 0,
                end: 100
            }
        ],
        series: [
         {
            type: 'candlestick',
            name: 'Candle',
            data: data_array,
            itemStyle: {
                normal: {
                    color: downColor,
                    color0: upColor,
                    borderColor: null,
                    borderColor0: null
                }
            }
        }, {
            name: 'MA5',
            type: 'line',
            showSymbol: false,
            data: dataMA5,
            smooth: true,
            color: '#bf20c7',
            lineStyle: {
                normal: {opacity: 0.8}
            }
        }, {
            name: 'MA20',
            type: 'line',
            showSymbol: false,
            data: dataMA20,
            smooth: true,
            color: '#e8d01e',
            lineStyle: {
                normal: {opacity: 0.7}
            }
        }, {
            name: 'MA60',
            type: 'line',
            showSymbol: false,
            data: dataMA60,
            smooth: true,
            color: '#459615',
            lineStyle: {
                normal: {opacity: 0.7}
            }
        }, {
            name: 'MA120',
            type: 'line',
            showSymbol: false,
            data: dataMA120,
            smooth: true,
            color: '#545454',
            lineStyle: {
                normal: {opacity: 0.7}
            }
        },


         {
            name: '거래량',
            type: 'bar',
            xAxisIndex: 1,
            yAxisIndex: 1,
            itemStyle: {
                normal: {
                    color: '#7fbe9e'
                },
                emphasis: {
                    color: '#140'
                }
            },
            data: volumes
        },{
            name: '공매잔량',
            type: 'line',
            xAxisIndex: 2,
            yAxisIndex: 2,
            itemStyle: {
                normal: {
                    color: '#7fbe9e'
                },
                emphasis: {
                    color: '#140'
                }
            },
            data: shortbalance
        }
        // Add graph Start

        , {
            name: '기관',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 3, // Index 를 맞춰줘야 함
            yAxisIndex: 3, // Index 를 맞춰줘야 함
            data: inscumsum,
            itemStyle: {
                color: '#DD4132',
            },
            lineStyle: {
                type:'dashed'
            }
        }
        , {
            name: '외인',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 3, // Index 를 맞춰줘야 함
            yAxisIndex: 3, // Index 를 맞춰줘야 함
            data: foreicumsum,
            itemStyle: {
                color: '#00539C',
            },
            lineStyle: {
                type:'dashed'
            }
        }

            , {
            name: '개인',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 3, // Index 를 맞춰줘야 함
            yAxisIndex: 3, // Index 를 맞춰줘야 함
            data: percumsum,
            itemStyle: {
                color: '#343148',
            },
            lineStyle: {
                type:'dashed'
            }
        }
        , {
            name: '연기금',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 3, // Index 를 맞춰줘야 함
            yAxisIndex: 3, // Index 를 맞춰줘야 함
            data: ygcumsum,
            itemStyle: {
                color: '#FE840E',
            },
            lineStyle: {
                type:'dashed'
            }
        }    , {
            name: '사모펀드',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 3, // Index 를 맞춰줘야 함
            yAxisIndex: 3, // Index 를 맞춰줘야 함
            data: samocumsum,
            itemStyle: {
                color: '#52a93e',
            },
            lineStyle: {
                type:'dashed'
            },
        } ,

        {
            name: '투신',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 3, // Index 를 맞춰줘야 함
            yAxisIndex: 3, // Index 를 맞춰줘야 함
            data: tusincumsum,
            itemStyle: {
                color: '#D5AE41',
            },
            lineStyle: {
                type:'dashed'
            },
        } ,
        {
            name: '금융',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 3, // Index 를 맞춰줘야 함
            yAxisIndex: 3, // Index 를 맞춰줘야 함
            data: financumsum,
            itemStyle: {
                color: '#9C9A40',
            },
            lineStyle: {
                type:'dashed'
            }
        },

        {
            name: '기타법인',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 3, // Index 를 맞춰줘야 함
            yAxisIndex: 3, // Index 를 맞춰줘야 함
            data: othercorporcumsum,
            itemStyle: {
                color: '#D5AE41',
            },
            lineStyle: {
                type:'dashed'
            },
        } ,
        {
            name: '보험',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 3, // Index 를 맞춰줘야 함
            yAxisIndex: 3, // Index 를 맞춰줘야 함
            data: insurcumsum,
            itemStyle: {
                color: '#D5AE41',
            },
            lineStyle: {
                type:'dashed'
            },
        } ,
        {
            name: '은행',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 3, // Index 를 맞춰줘야 함
            yAxisIndex: 3, // Index 를 맞춰줘야 함
            data: bankcumsum,
            itemStyle: {
                color: '#D5AE41',
            },
            lineStyle: {
                type:'dashed'
            },
        } ,
            , {
            name: '모건',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 3, // Index 를 맞춰줘야 함
            yAxisIndex: 3, // Index 를 맞춰줘야 함
            data: mgcumsum,
            itemStyle: {
                color: '#005960',
            },
            lineStyle: {
                type:'dashed'
            }
        }    , {
            name: '골드만',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 3, // Index 를 맞춰줘야 함
            yAxisIndex: 3, // Index 를 맞춰줘야 함
            data: gmcumsum,
            itemStyle: {
                color: '#5A7247',
            },
            lineStyle: {
                type:'dashed'
            }
        }    , {
            name: 'CS',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 3, // Index 를 맞춰줘야 함
            yAxisIndex: 3, // Index 를 맞춰줘야 함
            data: cscumsum,
            itemStyle: {
                color: '#B76BA3',
            },
            lineStyle: {
                type:'dashed'
            }
        }    , {
            name: '메릴',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 3, // Index 를 맞춰줘야 함
            yAxisIndex: 3, // Index 를 맞춰줘야 함
            data: mrcumsum,
            itemStyle: {
                color: '#CE3175',
            },
            lineStyle: {
                type:'dashed'
            }
        }    , {
            name: '맥쿼리',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 3, // Index 를 맞춰줘야 함
            yAxisIndex: 3, // Index 를 맞춰줘야 함
            data: mqcumsum,
            itemStyle: {
                color: '#006E51',
            },
            lineStyle: {
                type:'dashed'
            }
        }    , {
            name: 'CLSA',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 3, // Index 를 맞춰줘야 함
            yAxisIndex: 3, // Index 를 맞춰줘야 함
            data: clcumsum,
            itemStyle: {
                color: '#9E4624',
            },
            lineStyle: {
                type:'dashed'
            }
        }    , {
            name: 'UBS',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 3, // Index 를 맞춰줘야 함
            yAxisIndex: 3, // Index 를 맞춰줘야 함
            data: ubcumsum,
            itemStyle: {
                color: '#B93A32',
            },
            lineStyle: {
                type:'dashed'
            }
        }    , {
            name: '노무라',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 3, // Index 를 맞춰줘야 함
            yAxisIndex: 3, // Index 를 맞춰줘야 함
            data: nmcumsum,
            itemStyle: {
                color: '#034f84',
            },
            lineStyle: {
                type:'dashed'
            }
        }, {
            name: '도이치',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 3, // Index 를 맞춰줘야 함
            yAxisIndex: 3, // Index 를 맞춰줘야 함
            data: dccumsum,
            itemStyle: {
                color: '#92a8d1',
            },
            lineStyle: {
                type:'dashed'
            }
        }, {
            name: '다이와',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 3, // Index 를 맞춰줘야 함
            yAxisIndex: 3, // Index 를 맞춰줘야 함
            data: dwcumsum,
            itemStyle: {
                color: '#7e4a35',
            },
            lineStyle: {
                type:'dashed'
            }
        }, {
            name: '제이피',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 3, // Index 를 맞춰줘야 함
            yAxisIndex: 3, // Index 를 맞춰줘야 함
            data: jpcumsum,
            itemStyle: {
                color: '#7e4a35',
            },
            lineStyle: {
                type:'dashed'
            }
        }, {
            name: '씨티',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 3, // Index 를 맞춰줘야 함
            yAxisIndex: 3, // Index 를 맞춰줘야 함
            data: ctcumsum,
            itemStyle: {
                color: '#7e4a35',
            },
            lineStyle: {
                type:'dashed'
            }
        }, {
            name: '신영',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 3, // Index 를 맞춰줘야 함
            yAxisIndex: 3, // Index 를 맞춰줘야 함
            data: sycumsum,
            itemStyle: {
                color: '#7e4a35',
            },
            lineStyle: {
                type:'dashed'
            }
        }, {
            name: '한투',
            type: 'line',
            smooth: true,
            showSymbol: false,
            xAxisIndex: 3, // Index 를 맞춰줘야 함
            yAxisIndex: 3, // Index 를 맞춰줘야 함
            data: htcumsum,
            itemStyle: {
                color: '#7e4a35',
            },
            lineStyle: {
                type:'dashed'
            }
        }









        // Add graph End
        ]
    });
    }
