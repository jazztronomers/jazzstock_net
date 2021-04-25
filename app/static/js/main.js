// ==============================================================
// GLOBAL + CONFIG
// ==============================================================
// COLOR

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

let vma_map = new Map()

vma_map['R9'] = [999, 12, R[9]]
vma_map['R8'] = [12, 9, R[8]]
vma_map['R7'] = [9, 7, R[7]]

vma_map['R6'] = [7, 5, R[6]]
vma_map['R5'] = [5, 4, R[5]]
vma_map['R4'] = [4, 3,  R[4]]

vma_map['R3'] = [3, 1.5,   R[3]]
vma_map['R2'] = [1.5, 1,   R[2]]
vma_map['R1'] = [1, 0.3,   R[1]]

vma_map['MM'] = [0.30, -0.1, '#ffffff']

vma_map['B1'] = [-0.1, -0.3, B[1]]
vma_map['B2'] = [-0.3, -0.6, B[2]]
vma_map['B3'] = [-0.6, -0.8, B[3]]
vma_map['B4'] = [-0.8, -1.0, B[4]]

let per_map = new Map()

per_map['R4'] = [5, 0, R[4]]
per_map['R3'] = [12, 5, R[3]]
per_map['R2'] = [20, 12, R[2]]
per_map['R1'] = [40, 20, R[1]]

per_map['MM'] = [9999, 40, B[2]]

per_map['B4'] = [-0.1, -200, B[4]]

let pbr_map = new Map()

pbr_map['R4'] = [1, 0, R[4]]
pbr_map['R3'] = [2, 1, R[3]]
pbr_map['R2'] = [4, 2, R[2]]
pbr_map['R1'] = [8, 4, '#ffffff']


pbr_map['R1'] = [8, 4, B[2]]
pbr_map['MM'] = [500, 8, B[3]]


let roe_map = new Map()

roe_map['R4'] = [100, 25, R[7]]
roe_map['R3'] = [25, 15, R[5]]
roe_map['R2'] = [15, 7, R[3]]
roe_map['R1'] = [7, 3, R[1]]

roe_map['MM'] = [7, 0, '#ffffff']

roe_map['B4'] = [-0.1, -200, B[4]]

let ccr_map = new Map()

ccr_map['R3'] = [0.1, 0, R[5]]
ccr_map['R2'] = [0.2, 0.1, R[3]]
ccr_map['R1'] = [0.35, 0.2, R[1]]
ccr_map['MM'] = [0.75, 0.3, '#ffffff']
ccr_map['B1'] = [0.8, 0.75, B[1]]
ccr_map['B2'] = [0.9, 0.8, B[2]]
ccr_map['B3'] = [1.1, 0.9, B[4]]


const array_filter = ["filter_a",
               "filter_b",
               "filter_c",
               "filter_d",
               "filter_e",
               "mc_min",
               "mc_max"]


let tab_initialized = new Map

tab_initialized['table_insfor']=false
tab_initialized['table_forins']=false
tab_initialized['table_ygfor']=false
tab_initialized['table_samofor']=false
tab_initialized['table_custom']=false
tab_initialized['table_full']=false
tab_initialized['table_fav']=false

let stockcode_favorite = []
let recent_trading_days = []
let user_loggedin = false
let user_expiration_date = '1970-01-01'
let column_spec_list = []
let recent_tab = 'tab_insfor'
let tab_array = ["tab_insfor", "tab_forins", "tab_ygfor", "tab_samofor", "tab_custom", "tab_fav", "tab_full"]

$.fn.dataTable.ext.order['dom-checkbox'] = function  ( settings, col )
{
    console.log("dom sort start")
    return this.api().column( col, {order:'index'} ).nodes().map( function ( td, i ) {
        return $('input', td).prop('checked') ? '1' : '0';
    } );
}

$.fn.dataTable.ext.search.push(
    function( settings, data, dataIndex ) {

        let min = parseInt( $('#mc_min').val(), 10 );
        let max = parseInt( $('#mc_max').val(), 10 );
        let age = parseFloat( data[2] ) || 0; // use data for the age column

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
    getTable('table_insfor',  ['P','I','F'], [1,5,20,60], ['I1'], 'DESC', 100, false, true,  false, 0);

    array_filter.forEach(function (filter_id, index) {

        filter_value = localStorage.getItem("jazzstock_" + filter_id)
        document.getElementById(filter_id).value=filter_value

    });
    getFavorite()
    getUserInfo()
    getSpecification()
    getRecentTradingDays()
    console.log(' * Document initialized', now())

})


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
                if (req.response.result == false){
                    alert(req.response.message)
                }
                else{

                    response = req.response.result
                    alert("즐겨찾기리스트가 업데이트되었습니다.")
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


function getRecentTradingDays(){

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

                recent_trading_days = req.response.content
                select_box = document.getElementById('select_custom_date')

                for (let i = 0; i<=recent_trading_days.length-1; i++){
                    let opt = document.createElement('option');
                    opt.value = i;
                    opt.innerHTML = recent_trading_days[i];
                    select_box.appendChild(opt);
                }




            }
        }
    }

    req.open('POST', '/getRecentTradingDays')
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    req.send()

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

    for (let i=0; i<tabtables.length; i++){

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

    let dataTable = $('#' + tableId).dataTable();
    let input = $(".dataTables_filter input")
    input.val(keywords)

    keywords = input.val().split(' '), filter ='';
    for (let i=0; i<keywords.length; i++) {
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

function getTable(tableId, targets, intervals, orderby, orderhow, limit, fav_only=false, init=false, only_supporter=false, date_idx=0)
{

    // console.log(' * get table...', tableId, tab_initialized[tableId])

    if(tab_initialized[tableId] == false || init==false){
        tab_initialized[tableId]=true
        if(init==false){
            clearTable(tableId)
        }
        let req = new XMLHttpRequest()
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
//                    if (isJsonString(req.responseText)){
//                        alert(JSON.parse(req.responseText).message)
//                    }
//                    else{
                        response = JSON.parse(req.responseText)
                        if (response.result==false){
                            alert(response.message)
                        }

                        else{
                            renderTable(tableId, response.htmltable, response.column_list)
                        }

                }
            }
        }

        req.open('POST', '/ajaxTable')
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
        req.send('targets=' + targets + '&intervals=' + intervals + "&orderby=" + orderby + "&orderhow=" + orderhow + "&limit=" + limit  + "&fav_only=" + fav_only + "&only_supporter="+ only_supporter + "&date_idx=" + date_idx)
    }

    else{
        // console.log(tableId, "already")
        let table = $('#'+tableId).DataTable();
        table.draw();
    }
}




function clearTable(tableId){

    console.log("clear table", tableId)

      let table = $('#'+tableId).DataTable();
      table.destroy()
      if(null!=document.getElementById(tableId)){
           document.getElementById(tableId).innerHTML='<tr><td class="loading"><div class="signal"></div></td></tr>';
      }

}


function removeall(){

    let chartlist = document.getElementsByClassName('sndChart');
    let infolist = document.getElementsByClassName('infoTable');
    for (let i = 0; i < chartlist.length; i++)
    {

        let tempid = chartlist[i].id

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

        let myNode = document.getElementById(tempid);
        while (myNode.firstChild) {
            myNode.removeChild(myNode.firstChild);
        }

        chartlist[i].removeAttribute('_echarts_instance_')
        chartlist[i].setAttribute("style","height: 1px")


    }


}


function removeChart(id){

    console.log(" * CHART TO REMOVE", id)
    let chartlist = [document.getElementById(id)];
    for (let i = 0; i < chartlist.length; i++)
    {

        let tempid = chartlist[i].id

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

        let myNode = document.getElementById(tempid);
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



    if (tab_array.includes(pageName)){

        recent_tab = pageName
        prevTab = document.getElementById("prev_tab")
        prevTab.style.display = "none";

    }

    else {

        prevTab = document.getElementById("prev_tab")
        prevTab.style.display = "block";
        prevTab.style.backgroundColor = "#F9A602";
    }

    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].style.backgroundColor = "";
        tablinks[i].style.color = "white";
    }


    document.getElementById(pageName).style.display = "block";

    if (tab_array.includes(elmnt)){

        let tab_link = document.getElementById(elmnt+'_link')
        tab_link.style.backgroundColor = "#F9A602";
        tab_link.style.color = "black";

    }

//    else if (elmnt.endsWith("_link")){
//        // 이미조회했던 종목인 경우
//        console
//        let tab_link = document.getElementById(elmnt+'_link')
//        tab_link.style.backgroundColor = "#F9A602";
//        tab_link.style.color = "black";
//
//    }

    else {
        // this 인경우
        elmnt.style.backgroundColor = "#F9A602";
        elmnt.style.color = "black";
    }

}

var stockQueue = [];

function getRealtime(){
    alert("개발중인 기능입니다.")
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



    let tabMenu= document.getElementById('navigation_stock') // tabMenu

    let prevTab = document.getElementById("prev_tab")
    prevTab.setAttribute("style", "display:block");
    prevTab.setAttribute("onclick", "openPage('"+recent_tab+"', '" + recent_tab + "', '#F9A602')");


    let tablink = document.createElement("a")


    tablink.setAttribute("class", "tablink");
    tablink.setAttribute("id", "tablink_"+stockcode);
    tablink.setAttribute("onclick", "openPage('tab_"+stockcode+"', this, 'red')");
    tablink.innerHTML=stockname;

    tabMenu.appendChild(tablink)

    let tabConts= document.getElementById('tabConts')

        let tabCont = document.createElement("div")
        tabCont.setAttribute("class", "tabcontent");
        tabCont.setAttribute("id", "tab_"+stockcode);
        tabCont.setAttribute("style", "display:block");

            let table_finan =document.createElement("table")

            table_finan.setAttribute("class", "finanTable");
            table_finan.setAttribute("id", "finan"+stockcode);
            table_finan.setAttribute("style", "width:100%");


            let chart = document.createElement("div");

            chart.setAttribute("id", "chart"+stockcode);
            chart.setAttribute("class", "sndChart");

        tabCont.appendChild(table_finan);
        tabCont.appendChild(document.createElement("br"));
        tabCont.appendChild(chart);

    console.log(tabCont)

    tabConts.appendChild(prevTab);
    tabConts.appendChild(tabCont);


}

function removeOldestTab(){

    let tabMenu= document.getElementById('navigation_stock')
    tabMenu.removeChild(tabMenu.getElementsByTagName('a')[0])

    let tabConts = document.getElementById('tabConts')
    tabConts.removeChild(tabConts.getElementsByTagName('div')[0])

}


function login(){

    if(event.key === 'Enter' || null == event.key) {
        let email = document.getElementById('email').value
        let pw = SHA256(document.getElementById('pw').value)
        let req = new XMLHttpRequest()
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
}



function logout(){
    let req = new XMLHttpRequest()
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


function getSpecification(){

    let req = new XMLHttpRequest()
    req.responseType = 'json';
    req.onreadystatechange = function()
    {
        if (req.readyState == 4)
        {
            if (req.status == 200){
                console.log(" * getSpecification...:")
                column_spec_list = req.response
                select_box = document.getElementById('specification_selectbox')


                for (let i = 0; i<=column_spec_list.length-1; i++){
                    let opt = document.createElement('option');
                    opt.value = column_spec_list[i].column_description;
                    opt.innerHTML = column_spec_list[i].column_name;
                    select_box.appendChild(opt);
                }
            }
        }
    }

    req.open('POST', '/getSpecification')
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    req.send()
}

function drawSpecification(opt){

    content_field = document.getElementById('specification_content')
    content_field.innerHTML  =  opt.value
}

function getUserInfo(){

    let req = new XMLHttpRequest()
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
        document.getElementById('induce_signin').style.display = "none";

    }

    expdate = new Date(user_expiration_date).setHours(0,0,0,0)
    curdate = new Date().setHours(0,0,0,0)

    if (expdate>=curdate){

        console.log(" * Supporter function rendering....")
        let class_for_supporter = document.getElementsByClassName('only_supporter')
        for (i = 0; i < class_for_supporter.length; i++) {
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

    let content = document.getElementById('description');

    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }


}


function openExpandFunction(){

    let content = document.getElementById('function_expanded');

    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }


}



function openColumnSpec(){

    let content = document.getElementById('specification');

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

    let req = new XMLHttpRequest()
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

    let content = document.getElementById('download');

    if (content.style.display === "block") {
      content.style.display = "none";
    } else {
      content.style.display = "block";
    }

}



function sleep(milliseconds) {
  let start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}


function getTableCustom(){


    let select_custom_date_idx = document.getElementById("select_custom_date").value
    let select_custom_a = document.getElementById("select_custom_a").value
    let select_custom_b = document.getElementById("select_custom_b").value
    let select_custom_order_by = document.getElementById("select_custom_order_by").value
    let select_custom_order_how = document.getElementById("select_custom_order_how").value
    getTable('table_custom',  ['P', select_custom_a, select_custom_b], [1,5,20,60], [select_custom_a + select_custom_order_by], select_custom_order_how, 100, false, false, true, select_custom_date_idx);

}


function getChartData(stockcode, stockname){


    if (stockQueue.includes(stockcode)){
        openPage("tab_"+stockcode, document.getElementById("tablink_"+stockcode), "yellow");
        // document.getElementById("tabcontent"+stockcode).innerHTML=stockname
    }
    else {

        let req = new XMLHttpRequest()
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
                        openPage("tab_"+stockcode, document.getElementById("tablink_"+stockcode), "yellow");
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
                        autoWidth:false,

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

function getColumnDefs(column_list){

    columns_def = []
    for (i=0; i<column_list.length; i++){
        for (j=0; j<column_spec_list.length; j++){

            if (column_list[i] == column_spec_list[j].column_name ||
                (null !=column_spec_list[j].column_childs && column_spec_list[j].column_childs.includes(column_list[i]))){
                if (null != column_spec_list[j].column_def){

                    let column_def = Object.assign({}, column_spec_list[j].column_def)

                    column_def.targets=i
                    if (null != column_def.render){
                        column_def.render = getDataTableRenderMethod(column_def.render)
                    }

                    if ('stockname' == column_def.created_cell){
                        column_def.createdCell = function(cell, cellData, rowData, rowIndex, colIndex){

                            let stockcode_stockname = cellData.split("_")
                            stockcode = stockcode_stockname[0]
                            stockname = stockcode_stockname[1]
                            title = getChartlink(stockcode, stockname)

                            $(cell).html(title)

                            // color = getColoringBool(stockcode)
                            // $(cell).css('background-color', '#ffffff')
                            // console.log(stockname, color)

                        }
                    }

                    else if ('fav' == column_def.created_cell){
                        column_def.createdCell = function(cell, cellData, rowData, rowIndex, colIndex){
                            title = getFavCheckbox(cellData)
                            $(cell).html(title)
                        }
                    }

                    columns_def.push(column_def)
                    break;
                }

            }

        }
    }


    return columns_def
}

function getDataTableRenderMethod(round=0){
    return $.fn.dataTable.render.number( ',', '.', round, '')
}

function getChartlink(stockcode, stockname){


        title = '<div id="table_daily_stockcode_'+stockcode+'" style=""><a href="#" onclick="getChartData(' + "'"  + stockcode +"','" + stockname + "');\">" + stockname + '</a></div>'
        return title
}



function getFavCheckbox(cellData){

    if (stockcode_favorite.includes(cellData)){
        return '<input type="checkbox" onchange="handleChange(this)" value="'+ cellData +'" checked>'
    }
    else {
        return '<input type="checkbox" onchange="handleChange(this)" value="'+ cellData +'">'
    }
}