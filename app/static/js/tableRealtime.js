var today_date = '1970-01-01'
var today_starting_sequence = 0
var seq_max_date_zero = 0
var seq_max = 0
var stockcodes_realtime = 0
var column_list = []

function getRealtimeDev(){
    getTodaysDateAndStartingSeq(true)
}


/* 오늘의 일자와, DATABASE상의 StartingSequence를 가져오는 함수 */
/* return 결과를 기반으로 현재 개장여부를 함께 판단할 수 있음 */
function getTodaysDateAndStartingSeq(init=false){

    console.log(now(), ' * getTodaysDateAndStartingSeq: ')

    var today = new Date();
    var dow = today.getDay();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today_date = yyyy+'-'+mm+'-'+dd

    var now_hhmm = String(today.getHours()).padStart(2,'0') + String(today.getMinutes()).padStart(2,'0')

    var req = new XMLHttpRequest()
    req.responseType = 'json';
    req.onreadystatechange = function()
    {
        if (req.readyState == 4)
        {
            if (req.status == 200){

                if(req.response.result == false)
                {
                    alert("서버에서 데이터를 받아오지 못했습니다, 다시 시도해주세요")
                }
                else {

                    date_zero = req.response.date_zero
                    date_one = req.response.date_one
                    seq_max_date_zero = req.response.seq_max_date_zero
                    seq_max = req.response.seq_max


                    console.log(' * getTodaysDateAndStartingSeq, date_one:', date_one)
                    console.log(' * getTodaysDateAndStartingSeq, date_zero:', date_zero)
                    console.log(' * getTodaysDateAndStartingSeq, seq_max_date_zero:', seq_max_date_zero)
                    console.log(' * getTodaysDateAndStartingSeq, seq_max:', seq_max)

                    // 최초실행시에만 다음함수를 Trigger 하도록
                    if (init==true){
                        // 장전, 최근 거래일자의 장중 5분SMAR데이터가 한방에 그려져야 함
                        if (dow > 0 && dow < 6) {

                            // 개장직전, 깨끗한 테이블이 만들어 져야함
                            if (now_hhmm >= '0840' && now_hhmm < '1640') {
                                console.log(" * Market Open: True")
                                getRealtimeTableHTML(date_zero, today_date, seq_max_date_zero) // init == true =>
                            }

                            else {

                                console.log(" * Market Open: False")
                                getRealtimeTableHTML(date_one, date_zero, 0) // init == true =>
                            }
                        }

                        else {
                            console.log(" * Market Open: False")
                            getRealtimeTableHTML(date_one, date_zero, 0) // init == true =>
                        }
                    }




                }
            }
        }
    }

    req.open('POST', '/getLastTradingDaysLastSeq')
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    req.send()

}


/* 오늘의 일자에 수집되고 있는 STOCKCODES로 RENDERING된 빈 테이블 HTML을 가져오는 함수 */
// param html_date: html table rendering 기준 date
// param fetch_date: 실시간 데이터 fetching 기준 date

function getRealtimeTableHTML(html_date, fetch_date, seq){


    console.log(now(), " * getRealtimeTableHTML")
    seq_max=0
    var req = new XMLHttpRequest()
    req.responseType = 'json';
    req.onreadystatechange = function()
    {
        if (req.readyState == 4)
        {
            if (req.status == 200){

                if(req.response.result == false)
                {
                    alert("서버에서 데이터를 받아오지 못했습니다, 새로고침해주세요.")
                }
                else {

                    renderTableRealtime("table_realtime", req.response.htmltable, req.response.column_list)
                    column_list = req.response.column_list
                    stocknames = req.response.stocknames
                    fetchRows(fetch_date, false)
                }
            }
        }
    }

    req.open('POST', '/getRealtimeTableHTML')
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    req.send('limit=' + 400 + '&the_date=' + html_date)

}



/* 실시간으로 생성되는 SMAR정보를 받아오는 함수 */
function fetchRows(the_date, realtime=true){

    console.log(now(), " * fetchRows")

    var req = new XMLHttpRequest()
    req.responseType = 'json';
    req.onreadystatechange = function()
    {
        if (req.readyState == 4)
        {
            if (req.status == 200){

                if(req.response.result == false)
                {
                    alert("서버에서 데이터를 받아오지 못했습니다, 새로고침해주세요.")
                }
                else {


                    cols = req.response.data
                    seq_max = req.response.seq_max

                    console.log(now(), " * fetchRows data received done, datalength: ", cols.length, " seq_max: ", seq_max)

                    var table = $('#table_realtime').DataTable();
                    if (cols.length > 0){
                        let i = 0;
                        (function loop() {
                            col_idx = _setRealtimeSmarRawdata(table, cols[i])
                            i+=1;
                            if( i < cols.length ) {
                                setTimeout(loop, 10);
                            }
                        }());
                    }
                    console.log(now(), "realtime table fetching done")

                }
            }
        }
    }

    if (realtime==true){
        req_date = today_date
    }
    else{
        req_date = the_date
    }

    req.open('POST', '/fetchRowsRealtime')
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    req.send('the_date=' + req_date + '&seq_max=' + seq_max)


}

/* 실시간으로 생성되는 SMAR정보를 테이블상에서 업데이트 하는 함수 */
function _setRealtimeSmarRawdata(table, col){

    // SET CELL VALUE
    // SET CELL BACKGROUND-COLOR

    // RECENT CLOSE IDX: 3
    // RECENT CLOSE OVER PREV CLOSE : 4
    // TRADING VALUE IDX: 5



    col_idx = column_list.indexOf(col.time)
    for (var i =0; i< col.stocks.length; i++){
        stockname = col.stocks[i].STOCKNAME
        row_idx = stocknames.indexOf(stockname)
        if (row_idx != -1){



            table.cell({row:row_idx, column:3}).data(col.stocks[i].CLOSE);


            table.cell({row:row_idx, column:col_idx}).data(col.stocks[i].VSMAR20);
            if (col.stocks[i].VSMAR20 > 3){
                $(table.cell({row:row_idx, column:col_idx}).node()).css({'background-color':R[3]})
            }
            else if (col.stocks[i].VSMAR20 > 2){
                $(table.cell({row:row_idx, column:col_idx}).node()).css({'background-color':R[2]})
            }
            else if (col.stocks[i].VSMAR20 > 1){
                $(table.cell({row:row_idx, column:col_idx}).node()).css({'background-color':R[1]})
            }
            else if (col.stocks[i].VSMAR20 > -1){
                $(table.cell({row:row_idx, column:col_idx}).node()).css({'background-color':'#ffffff'})
            }
            else if (col.stocks[i].VSMAR20 > -2){
                $(table.cell({row:row_idx, column:col_idx}).node()).css({'background-color':B[2]})
            }
            else {
                $(table.cell({row:row_idx, column:col_idx}).node()).css({'background-color':B[3]})
            }

            // IF LAST COL, UPDATE FIXED AREA
            if (i+1 == col.stocks.length){


                fluct = (col.stocks[i].CLOSE - table.cell({row:row_idx, column:2}).data()) / col.stocks[i].CLOSE * 100
                table.cell({row:row_idx, column:4}).data(fluct);
                table.cell({row:row_idx, column:5}).data(col.stocks[i].TRADINGVALUE);
            }
        }
    }
    sorting(table, col_idx)
    document.getElementById('realtime_message').innerHTML=''+ col.time+ '까지의 5분봉수치가 없데이트 되었습니다, 주가정보는 1분에 한번씩 수집합니다'
    return col_idx
}


// FETCH ROWS DRAWBACK
function sorting(table, col_idx){
    table
        .order( [ col_idx, 'desc' ] )
        .draw();
}
function scroll(){
    a = ''
}
function coloring(){
    a = ''
}





function renderTableRealtime(tableId, response, columnList){

    document.getElementById(tableId).innerHTML = response
    console.log(now(), ' * Realtime Table rendering start', tableId)
    column_list = columnList

    // 서버사이드에서 받아온 HTML테이블객체를 DATATABLE형태로 INITIALIZE
    $('#'+tableId).dataTable( {
        aaSorting: [],
        // stateSave:true,
        sScrollX:"100%",
        autoWidth:false,
        aLengthMenu: [ 15, 25, 35, 50, 100 ],
        iDisplayLength: 25,
        fixedHeader: true,
        columnDefs: getColumnDefs(columnList),
        scrollCollapse: true,
        fixedColumns : {//关键是这里了，需要第一列不滚动就设置1
            leftColumns : 13
        },

        rowCallback: function( row, data ) {
            conditionalFormattingRealtime(row, data, columnList, stockcode_favorite) // Conlorize + Modify inner cell value
        },
    } );



}


function _conditionalFormattingRealtime(row, data, column_list, stockcode_favorite){


    var stockcode_stockname = data[0].split("_")
    stockcode = stockcode_stockname[0]
    stockname = stockcode_stockname[1]

    title = '<div id="table_daily_stockcode_'+stockcode+'" style=""><a href="#" onclick="getChartData(' + "'"  + stockcode +"','" + stockname + "');\">" + stockname + '</a></div>'
    $('td:eq('+0+')', row).html(title)
    $('td:eq('+0+')', row).css('background-color', '#ffffff')

    if (stockcode_favorite.includes(stockcode)){
        $('td:eq('+0+')', row).css('background-color', '#eac112')
    }


    for (var i=0; i<column_list.length; i++){
        for (var j=0; j<column_spec_list.length; j++){
            if ((column_list[i] == column_spec_list[j].column_name || null !=column_spec_list[j].column_childs && column_spec_list[j].column_childs.includes(column_list[i]))){
                if ('profit_map' == column_spec_list[j].background_color_map){

                    for (color in profit_map){
                        if (data[i] >= profit_map[color][1] && data[i] < profit_map[color][0]){
                             $('td.col'+i, row).css('background-color', profit_map[color][2])
                            break
                        }
                    }
                }
                if ('rank_map' == column_spec_list[j].background_color_map){

                    for (color in rank_map){
                        if (data[i] >= rank_map[color][1] && data[i] < rank_map[color][0]){
                             $('td.col'+i, row).css('background-color', rank_map[color][2])
                            break
                        }
                    }
                }
                if ('bbp_map' == column_spec_list[j].background_color_map){

                    for (color in bbp_map){
                        if (data[i] >= bbp_map[color][1] && data[i] < bbp_map[color][0]){
                             $('td.col'+i, row).css('background-color', bbp_map[color][2])
                            break
                        }
                    }
                }
                if ('bbw_map' == column_spec_list[j].background_color_map){

                    for (color in bbw_map){
                        if (data[i] >= bbw_map[color][1] && data[i] < bbw_map[color][0]){
                             $('td.col'+i, row).css('background-color', bbw_map[color][2])
                            break
                        }
                    }
                }

                if ('vma_map' == column_spec_list[j].background_color_map){

                    for (color in vma_map){
                        if (data[i] >= vma_map[color][1] && data[i] < vma_map[color][0]){
                             $('td.col'+i, row).css('background-color', vma_map[color][2])
                            break
                        }
                    }
                }

                if ('per_map' == column_spec_list[j].background_color_map){

                    for (color in per_map){
                        if (data[i] >= per_map[color][1] && data[i] < per_map[color][0]){
                             $('td.col'+i, row).css('background-color', per_map[color][2])
                            break
                        }
                    }
                }

                if ('pbr_map' == column_spec_list[j].background_color_map){

                    for (color in pbr_map){
                        if (data[i] >= pbr_map[color][1] && data[i] < pbr_map[color][0]){
                             $('td.col'+i, row).css('background-color', pbr_map[color][2])
                            break
                        }
                    }
                }

                if ('roe_map' == column_spec_list[j].background_color_map){

                    for (color in roe_map){
                        if (data[i] >= roe_map[color][1] && data[i] < roe_map[color][0]){
                             $('td.col'+i, row).css('background-color', roe_map[color][2])
                            break
                        }
                    }
                }
            }
        }
    }

}