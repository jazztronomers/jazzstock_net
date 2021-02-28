q_interval = ['1','5','20']
q_orderby = '1'

m_table = new Map([
  ['A', ['0','1']],
  ['B', ['1','0']],
  ['C', ['2','3']],
  ['D', ['3','2']]
]);


R = ["#ffffff", "#ffeeec", "#ffdeda", "#ffcdc7", "#ffbcb5", "#ffaca2", "#ff9b90", "#ff8a7d", "#ff7a6b", "#ff6958"]
B = ["#ffffff", "#e8eff5", "#d1deea", "#b9cee0", "#a2bdd6", "#8badcb", "#749cc1", "#5c8cb7", "#457bac", "#2e6ba2"]

let profit_map = new Map()

profit_map['R9'] = [999, 60.0, R[9]]
profit_map['R8'] = [60.0, 36.0, R[8]]
profit_map['R7'] = [36.0, 24.0, R[7]]

profit_map['R6'] = [24.0, 18.0, R[6]]
profit_map['R5'] = [18.0, 12.0, R[5]]
profit_map['R4'] = [12.0, 7.2,  R[4]]

profit_map['R3'] = [7.2, 3.6,   R[3]]
profit_map['R2'] = [3.6, 1.2,   R[2]]
profit_map['R1'] = [1.2, 0.8,   R[1]]

profit_map['MM'] = [0.8, -0.8,  '#ffffff']

profit_map['B1'] = [-0.8, -1.2, B[1]]
profit_map['B2'] = [-1.2, -3.6, B[2]]
profit_map['B3'] = [-3.6, -7.2, B[3]]

profit_map['B4'] = [-7.2, -12.0, B[4]]
profit_map['B5'] = [-12.0, -18.0, B[5]]
profit_map['B6'] = [-18.0, -24.0, B[6]]

profit_map['B7'] = [-24.0, -36.0, B[7]]
profit_map['B8'] = [-36.0, -60.0, B[8]]
profit_map['B9'] = [-60.0, -999, B[9]]


let rank_map = new Map()
rank_map['R4'] = [3, 0, '#ffad99']
rank_map['R3'] = [7, 3, '#ffc2b2']
rank_map['R2'] = [20, 7, '#ffe0d9']
rank_map['R1'] = [500, 20, '#ffffff']

let bbw_map = new Map()
bbw_map['R4'] = [2.00, 0.35, R[4]]
bbw_map['R3'] = [0.35, 0.27, R[3]]
bbw_map['R2'] = [0.27, 0.23, R[2]]
bbw_map['R1'] = [0.23, 0.20, R[1]]

bbw_map['MM'] = [0.20, 0.15, '#ffffff']

bbw_map['B1'] = [0.15, 0.12, B[1]]
bbw_map['B2'] = [0.12, 0.10, B[2]]
bbw_map['B3'] = [0.10, 0.07, B[3]]
bbw_map['B4'] = [0.07, -1.00, B[4]]


let bbp_map = new Map()

bbp_map['R4'] = [2.00, 1.00, R[4]]
bbp_map['R3'] = [1.00, 0.90, R[3]]
bbp_map['R2'] = [0.90, 0.80, R[2]]
bbp_map['R1'] = [0.80, 0.65, R[1]]

bbp_map['MM'] = [0.65, 0.35, '#ffffff']

bbp_map['B1'] = [0.35, 0.20, B[1]]
bbp_map['B2'] = [0.20, 0.10, B[2]]
bbp_map['B3'] = [0.10, 0.00, B[3]]
bbp_map['B4'] = [0.00, -1.00, B[4]]


const array_filter = ["filter_a",
               "filter_b",
               "filter_c",
               "filter_d",
               "filter_e"]


let tab_initialized = new Map

tab_initialized['table_insfor']=false
tab_initialized['table_forins']=false
tab_initialized['table_ygfor']=false
tab_initialized['table_samofor']=false
tab_initialized['table_custom']=false
tab_initialized['table_full']=false
tab_initialized['table_fav']=false

var stockcode_favorite = []
var user_loggedin = false
var user_expiration_date = '1970-01-01'


$.fn.dataTable.ext.order['dom-checkbox'] = function  ( settings, col )
{
    console.log("dom sort start")
    return this.api().column( col, {order:'index'} ).nodes().map( function ( td, i ) {
        return $('input', td).prop('checked') ? '1' : '0';
    } );
}

$.fn.dataTable.ext.search.push(
    function( settings, data, dataIndex ) {

        var min = parseInt( $('#mc_min').val(), 10 );
        var max = parseInt( $('#mc_max').val(), 10 );
        var age = parseFloat( data[2] ) || 0; // use data for the age column

        if ( ( isNaN( min ) && isNaN( max ) ) ||
             ( isNaN( min ) && age <= max ) ||
             ( min <= age   && isNaN( max ) ) ||
             ( min <= age   && age <= max ) )
        {
            return true;
        }
        return false;
    }
);


$(document).ready(function(){



    // function getTable(tableId, targets, intervals, orderby, orderhow, limit, init=false)
    // getTable('table_insfor',  ['P','I','F','YG','S'], [1,5,20,60,120, 240], ["I1","F1"], 'DESC', 100, true);

    getTable('table_insfor',  ['P','I','F'], [1,5,20,60], ['I1'], 'DESC', 100, false, true);

    array_filter.forEach(function (filter_id, index) {

        filter_value = localStorage.getItem("jazzstock_" + filter_id)
        document.getElementById(filter_id).value=filter_value

    });
    getFavorite()
    getUserInfo()
    console.log(' * Document initialized', now())

})




function changeTable(tableid){


    var keyA = document.getElementById("select"+tableid+"A").value;
    var keyB = document.getElementById("select"+tableid+"B").value;


    getTable([keyA, keyB], "data"+tableid, "chart"+tableid ,q_interval, q_orderby);

}

function now(){
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()
    return time
}


function handleChange(row){

    if (stockcode_favorite.includes(row.value)){
        stock_idx = stockcode_favorite.indexOf(row.value)
        stockcode_favorite.splice(stock_idx, 1);
    }

    else{
        stockcode_favorite.push(row.value)
    }

}



function setFavorite(){

    console.log(stockcode_favorite)
    var req = new XMLHttpRequest()

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
                console.log(req.response.result)
                if (req.response.result == false){
                    alert(req.response.message)
                }
                else{

                    response = req.responseText
                    alert("즐겨찾기리스트가 업데이트되었습니다.")
                    console.log(response)
                }
            }
        }
    }

    console.log(" * Update favorite..")
    req.open('POST', '/setFavorite')
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    req.send('stockcode_favorite=' + encodeURIComponent(stockcode_favorite))

}

function getFavorite(){

    var req = new XMLHttpRequest()
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
                if (req.response.stockcode_favorite == null){
                    stockcode_favorite = []
                }

                else{
                    stockcode_favorite = req.response.stockcode_favorite.map(function(value,index) { return value[0]; });

                }

            }
        }
    }

    req.open('POST', '/getFavorite')
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    req.send()

}


function profile(){
    alert("아직 개발중입니다 ㅠ")
}


function setBuiltinFilter(from_id, to_id){

    /*
        Built-in filter ?
        MC와 I5같은 NUMERICAL COLUMN에 대해서 RANGE 조건을 설정하기위해서
        숨겨져있는 DIV의 값을 조정하기 위함
    */

    console.log(" * Set Builtin Filter..", from_id, to_id)
    filter_value = document.getElementById(from_id).value

    // PURE JS - change이벤트 트리거를 못하겠음
    // document.getElementById(to_id).value = filter_value

    // JQUERY
    $("#"+to_id).val(filter_value).change()

    // setStorage("jazzstock_"+filter_id, filter_value)

}


function hideColumn(tableId){

    if(tableId=="tab_full"){
        hideColumnFull(tableId)
    }
    else{
        hideColumnPartial(tableId)
    }


}

function setCustomFilter(filter_id){

    /*
        Custom filter ?
        사용자 별로설정 할 수 있는 filter값을 의미
        최종 target은 datatables의 search input 값
    */


    var tabtables = document.getElementsByClassName('tabtable')

    for (var i=0; i<tabtables.length; i++){

        if (tabtables[i].style.display=="block"){
            tableId=tabtables[i].id.replace("tab", "table")

            filter_value = document.getElementById(filter_id).value
            console.log(" * Set Filter..", filter_id, filter_value, tableId)
            setStorage("jazzstock_"+filter_id, filter_value)
            doSearching(filter_value, tableId)
            return true
        }
    }

    alert("대상 테이블탭이 활성화되지 않았습니다")

}

function doSearching(keywords, tableId){

    var dataTable = $('#' + tableId).dataTable();
    var input = $(".dataTables_filter input")
    input.val(keywords)

    var keywords = input.val().split(' '), filter ='';
    for (var i=0; i<keywords.length; i++) {
       filter = (filter!=='') ? filter+'|'+keywords[i] : keywords[i];
    }

    dataTable.fnFilter(filter, null, true, false, true, true);

}

function setStorage(storage_key, storage_value){
    localStorage.setItem(storage_key, storage_value);
}

function getStorageSize(){

    var _lsTotal = 0,
        _xLen, _x;
    for (_x in localStorage) {
        if (!localStorage.hasOwnProperty(_x)) {
            continue;
        }
        _xLen = ((localStorage[_x].length + _x.length) * 2);
        _lsTotal += _xLen;
        console.log(_x.substr(0, 50) + " = " + (_xLen / 1024).toFixed(2) + " KB")
    };
    console.log("Total = " + (_lsTotal / 1024).toFixed(2) + " KB");

}


function clearStorage(){

    console.log(" * Clear local storage...", localStorage)
    localStorage.clear()
    console.log(" * Clear local storage - done", localStorage)

}

function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function getTable(tableId, targets, intervals, orderby, orderhow, limit, fav_only=false, init=false, only_supporter=false)
{

    console.log(' * get table...', tableId, tab_initialized[tableId])

    if(tab_initialized[tableId] == false){
        tab_initialized[tableId]=true
        if(init==false){
            clearTable(keyA, keyB, tableId,chartId)
        }
        var req = new XMLHttpRequest()
        req.onreadystatechange = function()
        {
            if (req.readyState == 4)
            {
                if (req.status != 200)
                {
                    alert("테이블을 가져오는데 실패하였습니다, 다시 시도해주세요")
                }
                else
                {
                    if (isJsonString(req.responseText)){
                        alert(JSON.parse(req.responseText).message)
                    }
                    else{
                        response = req.responseText
                        if (tableId == 'table_full' || tableId=='table_fav'){
                            if (response.length<5000){
                                alert("즐겨찾기 종목이 없습니다..")
                            }
                            renderTableFull(tableId, response)

                        }
                        else{
                            renderTablePartial(tableId, response)
                        }
                    }
                }
            }
        }

        req.open('POST', '/ajaxTable')
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
        req.send('targets=' + targets + '&intervals=' + intervals + "&orderby=" + orderby + "&orderhow=" + orderhow + "&limit=" + limit  + "&fav_only=" + fav_only + "&only_supporter="+ only_supporter)

    }

    else{
        console.log(tableId, "already")
    }
}




function clearTable(keyA, keyB, tableId,chartId){

      var table = $('#'+tableId).DataTable();
      table.destroy()
      if(null!=document.getElementById(tableId)){
           document.getElementById(tableId).innerHTML='<tr><td class="loading"><div class="signal"></div></td></tr>';
      }

}


function removeall(){

    var chartlist = document.getElementsByClassName('sndChart');
    var infolist = document.getElementsByClassName('infoTable');
    for (var i = 0; i < chartlist.length; i++)
    {

        var tempid = chartlist[i].id

      if(null!=document.getElementById(chartlist[i].id.replace('chart','related'))){

          if($.fn.DataTable.isDataTable('#'+chartlist[i].id.replace('chart','related'))){
            $('#'+chartlist[i].id.replace('chart','related')).DataTable().destroy();
          }
          document.getElementById(chartlist[i].id.replace('chart','related')).innerHTML=''
      }

    if(null!=document.getElementById(chartlist[i].id.replace('chart','info'))){

          if($.fn.DataTable.isDataTable('#'+chartlist[i].id.replace('chart','info'))){
            $('#'+chartlist[i].id.replace('chart','info')).DataTable().destroy();
          }
          document.getElementById(chartlist[i].id.replace('chart','info')).innerHTML=''
      }

  if(null!=document.getElementById(chartlist[i].id.replace('chart','finan'))){

          if($.fn.DataTable.isDataTable('#'+chartlist[i].id.replace('chart','finan'))){
            $('#'+chartlist[i].id.replace('chart','finan')).DataTable().destroy();
          }
          document.getElementById(chartlist[i].id.replace('chart','finan')).innerHTML=''
      }

        var myNode = document.getElementById(tempid);
        while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
        }

        chartlist[i].removeAttribute('_echarts_instance_')
        chartlist[i].setAttribute("style","height: 1px")


    }


}


function removeChart(id){

    console.log(" * CHART TO REMOVE", id)
    var chartlist = [document.getElementById(id)];
    for (var i = 0; i < chartlist.length; i++)
    {

        var tempid = chartlist[i].id

      if(null!=document.getElementById(chartlist[i].id.replace('chart','related'))){

          if($.fn.DataTable.isDataTable('#'+chartlist[i].id.replace('chart','related'))){
            $('#'+chartlist[i].id.replace('chart','related')).DataTable().destroy();
          }
          document.getElementById(chartlist[i].id.replace('chart','related')).innerHTML=''
      }

    if(null!=document.getElementById(chartlist[i].id.replace('chart','info'))){

          if($.fn.DataTable.isDataTable('#'+chartlist[i].id.replace('chart','info'))){
            $('#'+chartlist[i].id.replace('chart','info')).DataTable().destroy();
          }
          document.getElementById(chartlist[i].id.replace('chart','info')).innerHTML=''
      }

  if(null!=document.getElementById(chartlist[i].id.replace('chart','finan'))){

          if($.fn.DataTable.isDataTable('#'+chartlist[i].id.replace('chart','finan'))){
            $('#'+chartlist[i].id.replace('chart','finan')).DataTable().destroy();
          }
          document.getElementById(chartlist[i].id.replace('chart','finan')).innerHTML=''
      }

        var myNode = document.getElementById(tempid);
        while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
        }

        chartlist[i].removeAttribute('_echarts_instance_')
        chartlist[i].setAttribute("style","height: 1px")


    }


}

function removeRelated(relatedId){

      var table = $('#'+relatedId).DataTable();
      table.destroy()
      if(null!=document.getElementById(relatedId)){
           document.getElementById(relatedId).innerHTML=''
      }
}



function openPage(pageName, elmnt, color) {

    console.log(" * openPage... ", pageName)

    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].style.backgroundColor = "";
    }


    document.getElementById(pageName).style.display = "block";
}

var stockQueue = [];

function getRealtime(){
    alert("개발중인 기능입니다.")
}

function getRealtimeOnDev(){
    if(localStorage.getItem("jazzstock_latest_date")!= null){
        latest_date = localStorage.getItem("jazzstock_latest_date")

        console.log(latest_date)
    }
    else{
        var today = new Date();


        // console.log(d)
        // var utc = d.getTime();
        // var today = new Date(utc + (3600000*9));

        console.log(today)

        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        latest_date = yyyy+'-'+mm+'-'+dd

        console.log(latest_date)

    }
    if(localStorage.getItem("jazzstock_latest_seq")!=null){

        latest_seq = localStorage.getItem("jazzstock_latest_seq")
    }
    else{
        latest_seq = 0
    }

    console.log(" * Get realtime..latest date and timestamp..: ", latest_date, latest_seq)

    var req = new XMLHttpRequest()

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

                response = req.response

                if (response.realtime.result.length > 1){

                    // 이걸로 지지고 볶도록
                    // response.realtime.result
                    console.log(response.realtime.result)
                    console.log(response.realtime.length)
                    localStorage.setItem('jazzstock_latest_date', latest_date)
                    localStorage.setItem('jazzstock_latest_seq', response.realtime.result[response.realtime.result.length-1].SEQ)


                }

                else{
                    console.log(response.realtime.length)
                    console.log(" * Get realtime - response length is 0, pass")
                }



            }
        }
    }

    console.log(" * GET TABLE FROM DATABASE")
    req.open('POST', '/ajaxRealtime')
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    req.send('date="' + latest_date + '&seq="' + latest_seq + '"')


    console.log(latest_date, latest_seq)
}


function addTabToQueue(stockcode, stockname){


    console.log(" * addTabToQueue...", stockcode, stockname)
    // var min = new Date().getSeconds()
    if(stockQueue.length < 5){
        stockQueue.push(stockcode)
        addTabToPage(stockcode, stockname)
    }
    else {
        stockQueue.shift()
        removeOldestTab()
        stockQueue.push(stockcode)
        addTabToPage(stockcode, stockname)
    }

    console.log(' * CURRENT STOCK QUEUE', stockQueue)
}

function addTabToPage(stockcode, stockname){



    var tabMenu= document.getElementById('navigation_stock') // tabMenu
    var tablink = document.createElement("a")


    tablink.setAttribute("class", "tablink");
    tablink.setAttribute("id", "tablink_"+stockcode);
    tablink.setAttribute("onclick", "openPage('tab_"+stockcode+"', this, 'red')");
    tablink.innerHTML=stockname;

    tabMenu.appendChild(tablink)

    var tabConts= document.getElementById('tabConts')

        var tabCont = document.createElement("div")
        tabCont.setAttribute("class", "tabcontent");
        tabCont.setAttribute("id", "tab_"+stockcode);
        tabCont.setAttribute("style", "display:block");

            var table_finan =document.createElement("table")

            table_finan.setAttribute("class", "finanTable");
            table_finan.setAttribute("id", "finan"+stockcode);
            table_finan.setAttribute("style", "width:100%");


            var chart = document.createElement("div");

            chart.setAttribute("id", "chart"+stockcode);
            chart.setAttribute("class", "sndChart");

        tabCont.appendChild(table_finan);
        // tabCont.appendChild(document.createElement("br"));
        tabCont.appendChild(chart);

    console.log(tabCont)

    tabConts.appendChild(tabCont);


}

function removeOldestTab(){

    var tabMenu= document.getElementById('navigation_stock')
    tabMenu.removeChild(tabMenu.getElementsByTagName('a')[0])

    var tabConts = document.getElementById('tabConts')
    tabConts.removeChild(tabConts.getElementsByTagName('div')[0])

}


function login(){


    var email = document.getElementById('email').value
    var pw = SHA256(document.getElementById('pw').value)
    var req = new XMLHttpRequest()
    req.responseType = 'json';
    req.onreadystatechange = function()
    {
        if (req.readyState == 4)
        {
            if (req.status == 200){

                if(req.response.result == false)
                {
                    alert("존재하지 않는 계정이거나 비밀번호가 잘못되었습니다")
                }
                else {
                    alert("환영합니다!")
                    checkUuid()
                    window.location = "/";
                }
            }
        }
    }

    req.open('POST', '/login')
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    req.send('email='+email+'&pw='+pw)
}



function logout(){
    var req = new XMLHttpRequest()
    req.onreadystatechange = function()
    {
        if (req.readyState == 4)
        {
            if (req.status == 200)
            {
                console.log(' * LOGOUT, ', req.status)
                window.location = "/";
            }

        }
    }

    req.open('POST', '/logout')
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    req.send()

    return false
}


function getUserInfo(){

    var req = new XMLHttpRequest()
    req.responseType = 'json';
    req.onreadystatechange = function()
    {
        if (req.readyState == 4)
        {
            if (req.status == 200){
                console.log(" * getUserInfo...:", req.response)
                user_expiration_date = req.response.expiration_date
                user_loggedin = req.response.loggedin
                setMenu()
            }
        }
    }

    req.open('POST', '/getUserInfo')
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    req.send()
}

function setMenu(){
    /*
        접속상태, 맴버정보에따라서 메뉴배치를 변경하는 함수
    */
    if (user_loggedin==true){
        document.getElementById('notloggedin').style.display = "none";
        document.getElementById('loggedin').style.display = "block";
        document.getElementById('userinfo').style.display = "block";
    }

    expdate = new Date(user_expiration_date).setHours(0,0,0,0)
    curdate = new Date().setHours(0,0,0,0)

    if (expdate>=curdate){

        console.log(" * Supporter function rendering....")
        var class_for_supporter = document.getElementsByClassName('only_supporter')
        for (var i = 0; i < class_for_supporter.length; i++) {
            class_for_supporter[i].style.display="block"
        }
        // document.getElementById('only_supporter').style.display = "block";
        // document.getElementById('builtinFilter').style.display = "block";
    }
}



function clickPress(event,a,b) {
    if (event.keyCode == 13) {
        getChartData(a,b,c)
    }
}


function foldSearchingOption(){

    var content = document.getElementById('searchingOption');

    if (content.style.display === "block") {
        content.style.display = "none";
    } else {
        content.style.display = "block";
    }


}


function openForm() {
    document.getElementById("myForm").style.display = "block";
}

function closeForm() {
    document.getElementById("myForm").style.display = "none";
}


function description(){

    var content = document.getElementById('description');

    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }


}


function openExpandFunction(){

    var content = document.getElementById('function_expanded');

    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }


}

function checkUuid(){

    if(localStorage.getItem("jazzstock_uuid")==null){
        localStorage.setItem("jazzstock_uuid", uuidv4())
        console.log(" * localStorgae_uuid generated", localStorage.getItem('jazzstock_uuid'))
    }

    else{
        console.log(" * localStorgae_uuid existed", localStorage.getItem('jazzstock_uuid'))
    }

    updateUuid()

}

function updateUuid(){

    var req = new XMLHttpRequest()
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

                response = req.responseText
                console.log(' * uuid setted', response)
            }
        }
    }

    console.log(" * Update uuid..")
    req.open('POST', '/updateUuid')
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    req.send('uuid=' + localStorage.getItem('jazzstock_uuid'))

}

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}


function openDownload(){

    var content = document.getElementById('download');

    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }

}



function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}


function getChartData(stockcode, stockname){


    if (stockQueue.includes(stockcode)){
        openPage("tab_"+stockcode, this, "yellow");
        // document.getElementById("tabcontent"+stockcode).innerHTML=stockname
    }
    else {

        var req = new XMLHttpRequest()
        req.responseType = 'json';
        req.onreadystatechange = function()
        {
            if (req.readyState == 4)
            {
                if (req.status != 200)
                {
                    console.log('ERROR')
                }
                else
                {

                    addTabToQueue(stockcode, stockname)
                    chartId = "chart"+stockcode


                    if(req.response.sampledata!=null){
                        openPage("tab_"+stockcode, this, "yellow");
                        // document.getElementById("tabcontent"+stockcode).innerHTML=stockcode

                        if(document.body.clientWidth<500){
                            document.getElementById(chartId).style.height = "600px"
                        }

                        else{
                            document.getElementById(chartId).style.height = "1200px"
                        }


                        document.getElementById(chartId.replace('chart','finan')).innerHTML = req.response.finantable

                        $('#'+chartId.replace('chart','finan')).dataTable( {
                        aLengthMenu: [ 4, 12, 24 ],
                        aaSorting: [],
                        sScrollX:"100%",
                        autoWidth:true,

                        columnDefs: [
                                { width: 30, targets: 0 },
                                { width: 30, targets: 1 },
                                { width: 30, targets: 2 },
                                { width: 30, targets: 3 },
                                { width: 30, targets: 4 },
                                { width: 30, targets: 5 },
                                            ],
                        scrollCollapse: true,
                        fixedColumns : {//关键是这里了，需要第一列不滚动就设置1
                            leftColumns : 1
                        },

                        initComplete: function(settings){
                                $('#'+chartId.replace('chart','finan') +' thead th').each(function () {
                                   var $td = $(this);
                                  $td.attr('title', $td.attr('custom-title'));
                                });

                                /* Apply the tooltips */
                                $('#'+chartId.replace('chart','finan') +' thead th[title]').tooltip(
                                {
                                   "container": 'body'
                                });
                            }
                        } );



                        search(req.response.sampledata.result,'merge','chart'+stockcode)
                    }

                    else {
                        alert('해당 종목 데이터가 없습니다.')
                        removeall()
                    }
                }
            }
        }



        req.open('POST', '/ajaxChart')
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")

        req.send('stockcode="'+encodeURIComponent(stockcode)+'"')
        return false
    }


}


function renderTablePartial(tableId, response){

    document.getElementById(tableId).innerHTML = response
    console.log(' * Table rendering start', tableId, now())


    // 서버사이드에서 받아온 HTML테이블객체를 DATATABLE형태로 INITIALIZE
    $('#'+tableId).dataTable( {
        aaSorting: [],
        // stateSave:true,
        sScrollX:"100%",
        autoWidth:true,
        aLengthMenu: [ 15, 25, 35, 50, 100 ],
        iDisplayLength: 25,
        fixedHeader: true,
        columns: [
                { name:"STOCKNAME"},
                { name:"FAV", orderDataType: "dom-checkbox" },
                { name:"MC" },
                null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null, null, null,
                null, null, null, null, null, null, null, null
            ],
        columnDefs: [

                // { type: 'natural', targets: '_all'},

                { orderSequence: [ "desc", "asc"],
                  targets: [ 2,3,
                                4,  5,  6,  7,  8,  9,
                                10, 11, 12, 13, 14, 15,
                                16, 17, 18, 19, 20, 21,
                                        22,23,24,25,26,27,
                                        28,29,30,31,32,33] },
                // STOCKNAME


                { width: 70, targets: 0 },

                // FAV
                { width: 20, targets: 1},

                // MC
                { width: 30, targets: 2, render: $.fn.dataTable.render.number(',', '.', 1, '')},

                // CLOSE
                { width: 45, targets: 3, render: $.fn.dataTable.render.number( ',', '.', 0, '')},

                // P I F
                { width: 30, targets: [4,5,6,7,8,9,  10,11,12,13,14,15,  16,17,18,19,20,21,  22,23,24,25,26,27, 28,29,30,31,32,33] , render: $.fn.dataTable.render.number(',', '.', 2, '')},

                // RANK
                { width: 30, targets: [34, 35, 36, 37, 38, 39] },

                // EVENT PATTERN
                { width: 90, targets: 40 },

                // DAYS EVENT
                { width: 30, targets: [41,42,43,44] , render: $.fn.dataTable.render.number(',', '.', 0, '')},

                // BBP EVENT
                { width: 30, targets: [45,46,47,48] , render: $.fn.dataTable.render.number(',', '.', 2, '')},

                // BBW EVENT
                { width: 30, targets: [49,50,51,52] , render: $.fn.dataTable.render.number(',', '.', 2, '')},

                // FINAN
                { width: 30, targets: [53,54,55] , render: $.fn.dataTable.render.number(',', '.', 2, '')},

                // CATEGORY
                { width: 200, targets: [56] },

                { width: 60, targets: [57] }
        ],

        scrollCollapse: true,
        fixedColumns : {//关键是这里了，需要第一列不滚动就设置1
            leftColumns : 3
        },


        rowCallback: function( row, data ) {

            conditionalFormattingFull(row, data, stockcode_favorite) // Conlorize + Modify inner cell value

        },

    } );

    console.log(' * Table rendering DONE', now())
    hideColumn(tableId)
    var table = $('#'+tableId).DataTable();
    $('#mc_min, #mc_max').on("keyup input change propertychange", function() {
        table.draw()
    } );

}