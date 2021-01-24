q_interval = ['1','5','20']
q_orderby = '1'

m_table = new Map([
  ['A', ['0','1']],
  ['B', ['1','0']],
  ['C', ['2','3']],
  ['D', ['3','2']]
]);




$(document).ready(function(){


    if(localStorage.getItem("jazzstock_checked_interval")!=null){
        q_interval = localStorage.getItem("jazzstock_checked_interval").split(',')
    }

    if(localStorage.getItem("jazzstock_checked_orderby")!=null){
        q_orderby = localStorage.getItem("jazzstock_checked_orderby").split(',')
    }


    if(localStorage.getItem("jazzstock_table_a1")!=null){m_table.set('A',[localStorage.getItem("jazzstock_table_a1"),m_table.get('A')[1]]) ;document.getElementById('jazzstock_table_a1').value=m_table.get('A')[0]}
    if(localStorage.getItem("jazzstock_table_a2")!=null){m_table.set('A',[m_table.get('A')[0], localStorage.getItem("jazzstock_table_a2")]);document.getElementById('jazzstock_table_a2').value=m_table.get('A')[1]}
    document.getElementById('jazzstock_table_a1').value=m_table.get('A')[0]
    document.getElementById('jazzstock_table_a2').value=m_table.get('A')[1]




    var interval = document.getElementsByName("interval");
    for (var i = 0; i < interval.length; i++)
    {

        if(interval[i].type =='checkbox' && q_interval.includes(interval[i].value)){
            interval[i].checked=true
        }
    }

    var order = document.getElementsByName("orderby");
    for (var i = 0; i < order.length; i++)
    {

        if(order[i].type =='radio' && q_orderby.includes(order[i].value)){
            order[i].checked=true
        }
    }

    var order = document.getElementsByName




			$.extend( $.fn.dataTable.defaults, {
                searching: false,
            }


            );

    getTable(m_table.get('A')[0],m_table.get('A')[1],'dataA','chartA',q_interval, q_orderby, true);


})


function changeTable(tableid){


    var keyA = document.getElementById("select"+tableid+"A").value;
    var keyB = document.getElementById("select"+tableid+"B").value;


    getTable(keyA, keyB, "data"+tableid, "chart"+tableid ,q_interval, q_orderby);

}


function getTable(keyA, keyB, tableId,chartId,interval,orderby,init=false)
{

    //console.log(keyA, keyB, tableId, chartId,interval,orderby,init)
    if(init==false){clearTable(keyA, keyB, tableId,chartId)}
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

                document.getElementById(tableId).innerHTML = req.responseText
                    $('#'+tableId,).dataTable( {
                    aaSorting: [],
                    sScrollX:"100%",
					autoWidth:true,
					iDisplayLength: 50,
                    columnDefs: [
                            { width: 70, targets: 0 },
                            { width: 25, targets: 1 },
                            { width: 40, targets: 2 },
                            { width: 30, targets: 3 },
                            { width: 30, targets: 4 },
                            { width: 30, targets: 5 },
                            { width: 30, targets: 6 },
                            { width: 30, targets: 7 },
                            { width: 30, targets: 8 },
                            { width: 30, targets: 9 },
                            { width: 30, targets: 10 },
                            { width: 30, targets: 11 },

                            { width: 30, targets: 12 },
                            { width: 30, targets: 13 },
                            { width: 30, targets: 14 },
                            { width: 30, targets: 15 },
                            { width: 30, targets: 16 },
                            { width: 30, targets: 17 },

                            { width: 30, targets: 18 },
                            { width: 30, targets: 19 },
                            { width: 30, targets: 20 },
                            { width: 30, targets: 21 },
                            { width: 30, targets: 22 },
                            { width: 100, targets: 23 },

                            { width: 30, targets: 24 },
                            { width: 30, targets: 25 },
                            { width: 30, targets: 26 },
                            { width: 30, targets: 27 },

                            { width: 30, targets: 28 },
                            { width: 30, targets: 29 },
                            { width: 30, targets: 30 },
                            { width: 30, targets: 31 },

                            { width: 30, targets: 32 },
                            { width: 30, targets: 33 },
                            { width: 30, targets: 34 },
                            { width: 30, targets: 35 },

//                            { width: 30, targets: 36 },
//                            { width: 30, targets: 37 },
//                            { width: 30, targets: 38 },
//                            { width: 30, targets: 39 },
//
//                            { width: 30, targets: 40 },
//                            { width: 30, targets: 41 },
//                            { width: 30, targets: 42 },
//                            { width: 30, targets: 43 },

                                        ],
					scrollCollapse: true,
					fixedColumns : {//关键是这里了，需要第一列不滚动就设置1
	                    leftColumns : 2
	                },

                    initComplete: function(settings){
                            $('#'+tableId +' thead th').each(function () {
                               var $td = $(this);
                              $td.attr('title', $td.attr('custom-title'));
                            });

                            /* Apply the tooltips */
                            $('#'+tableId +' thead th[title]').tooltip(
                            {
                               "container": 'body'
                            });
                        }
                    } );

                console.log('DATATABLE ENABLED')

            }
        }
    }

    req.open('POST', '/ajaxTable')
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")

    req.send('keyA="' + keyA + '&keyB="' + keyB +'"&chartId="'+chartId+'"' +'"&interval="'+interval+'"&orderby="'+orderby+'"')

    return false
}


function clearTable(keyA, keyB, tableId,chartId){


      var table = $('#'+tableId).DataTable();
      table.destroy()
      if(null!=document.getElementById(tableId)){
           document.getElementById(tableId).innerHTML='<tr><td class="loading"><div class="signal"></div></td></tr>';
      }

}


function getRelated(chartId,stockcode)
{



    var req = new XMLHttpRequest()
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


                  if(null!=document.getElementById(chartId.replace('chart','related'))){

                      if($.fn.DataTable.isDataTable('#'+chartId.replace('chart','related'))){
                        $('#'+chartId.replace('chart','related')).DataTable().destroy();
                      }
                      document.getElementById(chartId.replace('chart','related')).innerHTML=''
                  }


                //console.log("HERE")
                document.getElementById(chartId.replace('chart','related')).innerHTML = req.responseText

                    $('#'+chartId.replace('chart','related')).dataTable( {
                    aaSorting: [],
                    sScrollX:"160%",
					autoWidth:true,
                    columnDefs: [
                            { width: 70, targets: 0 },
                            { width: 25, targets: 1 },
                            { width: 40, targets: 2 },
                            { width: 30, targets: 3 },
                            { width: 30, targets: 4 },
                            { width: 30, targets: 5 },
                            { width: 30, targets: 6 },
                            { width: 30, targets: 7 },
                            { width: 30, targets: 8 },
                            { width: 30, targets: 9 },
                            { width: 30, targets: 10 },
                            { width: 30, targets: 11 },
                            { width: 30, targets: 12 },
                            { width: 30, targets: 13 },
                            { width: 30, targets: 14 },
                            { width: 30, targets: 15 },
                            { width: 30, targets: 16 },
                            { width: 30, targets: 17 },
                            { width: 30, targets: 18 },
                            { width: 30, targets: 19 },
                            { width: 30, targets: 20 },
                            { width: 30, targets: 21 },
                            { width: 30, targets: 22 },
                            { width: 30, targets: 23 },
                            { width: 30, targets: 24 },
                            { width: 30, targets: 25 },
                            { width: 30, targets: 26 },
                            { width: 30, targets: 27 },
                            { width: 30, targets: 28 },
                            { width: 30, targets: 29 },
                            { width: 30, targets: 30 },

                            { width: 100, targets: 31 },

                            { width: 30, targets: 32 },
                            { width: 30, targets: 33 },
                            { width: 30, targets: 34 },
                            { width: 30, targets: 35 },

                            { width: 30, targets: 36 },
                            { width: 30, targets: 37 },
                            { width: 30, targets: 38 },
                            { width: 30, targets: 39 },

                            { width: 30, targets: 40 },
                            { width: 30, targets: 41 },
                            { width: 30, targets: 42 },
                            { width: 30, targets: 43 },

                                        ],
					fixedColumns : {//关键是这里了，需要第一列不滚动就设置1
	                    leftColumns : 2
	                }
                    } );


            }
        }
    }

    console.log('DATATABLE ENABLED here')


    req.open('POST', '/ajaxRelated')
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    req.send('chartId="'+chartId+'"'+'"&stockcode="'+stockcode+'"')
    return false
}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
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

    console.log(" * OPEN PAGE...", pageName, color)

    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].style.backgroundColor = "";
    }

    document.getElementById(pageName.replace('tab','tabcontent')).style.display = "block";

    // elmnt.style.backgroundColor = color;
}

var stockQueue = [];

function addTabToQueue(tabname){
    // var min = new Date().getSeconds()
    if(stockQueue.length < 5){
        stockQueue.push(tabname)
        addTabToPage(tabname)
    }
    else {
        stockQueue.shift()
        removeOldestTab()
        stockQueue.push(tabname)
        addTabToPage(tabname)
    }

    console.log(' * CURRENT STOCK QUEUE', stockQueue)
}

function addTabToPage(id){

    var tabMenu= document.getElementById('tabMenu')
    var tablink = document.createElement("BUTTON")
    tablink.setAttribute("class", "tablink");
    tablink.setAttribute("id", "tab"+id);
    tablink.setAttribute("onclick", "openPage('tab"+id+"', this, 'red')");
    tablink.innerHTML="tab"+id;
    tabMenu.appendChild(tablink)

    var tabConts= document.getElementById('tabConts')

    var tabCont = document.createElement("div")
    tabCont.setAttribute("class", "tabcontent");
    tabCont.setAttribute("id", "tabcontent"+id);
    tabCont.setAttribute("style", "display:block");


    var table_finan =document.createElement("table")

    table_finan.setAttribute("class", "finanTable");
    table_finan.setAttribute("id", "finan"+id);
    table_finan.setAttribute("style", "width:100%");
    table_finan.innerHTML='HELLO'

    var chart = document.createElement("div");
    chart.setAttribute("class", "sndChart");
    chart.setAttribute("id", "chart"+id);

    chart.setAttribute("style", "height: 1000px");

    tabCont.appendChild(table_finan);
    tabCont.appendChild(chart);
    tabConts.appendChild(tabCont);





}

function removeOldestTab(){

    var tabMenu= document.getElementById('tabMenu')
    tabMenu.removeChild(tabMenu.getElementsByTagName('button')[0])

}





function getChartData(stockcode, temp){


    if (stockQueue.includes("stockcode")){
        openPage("tab"+stockcode, this, "yellow");
        document.getElementById("tab"+stockcode).innerHTML=stockcode
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

                    // tab = stockQueuePop()

                    addTabToQueue(stockcode)

                    chartId = "chart"+stockcode
                    removeChart(chartId)


                    //console.log(req.response)
                    if(req.response.sampledata!=null){





                        // tab = stockQueuePop()
                        // chartId = "chart"+tab.slice(-1);
                        // 어느탭을 먼저 구현할지, Queue에서 tabID 받아오기

                        // document.getElementById("tab"+stockcode).innerHTML=stockcode
                        openPage("tab"+stockcode, this, "yellow");
                        document.getElementById("tab"+stockcode).innerHTML=stockcode

                        if(document.body.clientWidth<500){
                            document.getElementById(chartId).style.height = "600px"
                        }

                        else{
                            document.getElementById(chartId).style.height = "1000px"
                        }

                        // document.getElementById(chartId.replace('chart','info')).innerHTML='<a href ='getRelated>'+stockcode+'</span>'

                        if(chartId=='chartS'){
                            getRelated(chartId,stockcode);
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

function setStorage(){

    var q_interval = [];
    var q_orderby = [];
    var interval = document.getElementsByName("interval");
    for (var i = 0; i < interval.length; i++){

        if(interval[i].type =='checkbox' && interval[i].checked == true)
        {
            q_interval.push(interval[i].value)
        }
    }

    var order = document.getElementsByName("orderby");

    for (var i = 0; i < order.length; i++){

        if(order[i].type =='radio' && order[i].checked == true)
        {
            q_orderby.push(order[i].value)
        }
    }

    localStorage.setItem("jazzstock_checked_interval",q_interval);
    localStorage.setItem("jazzstock_checked_orderby",q_orderby);

    const array = ["jazzstock_table_a1",
                   "jazzstock_table_a2",
                   "jazzstock_table_b1",
                   "jazzstock_table_b2",
                   "jazzstock_table_c1",
                   "jazzstock_table_c2",
                   "jazzstock_table_d1",
                   "jazzstock_table_d2",]


    array.forEach(function (item, index) {
      a = document.getElementById(item)
      localStorage.setItem(item,a.options[a.selectedIndex].value)
      //console.log(item,a.options[a.selectedIndex].value)
    });





}