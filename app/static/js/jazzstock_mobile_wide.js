q_interval = ['1','5','20']
q_orderby = '1'


$(document).ready(function(){


    if(localStorage.getItem("checked_interval")!=null){
        q_interval = localStorage.getItem("checked_interval").split(',')
    }

    if(localStorage.getItem("checked_orderby")!=null){
        q_orderby = localStorage.getItem("checked_orderby").split(',')
    }


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


    getTable(0,'dataA','chartA',q_interval, q_orderby);
//    sleep(200)
//    getTable(1,'dataB','chartB',q_interval, q_orderby);
//    sleep(800)
//    getTable(2,'dataC','chartC',q_interval, q_orderby);
//    getTable(3,'dataD','chartD',q_interval, q_orderby);



})





function getTable(tableNum,tableId,chartId,interval,orderby)
{


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
                // pagination('#'+tableId,'#nav'+tableId,);
                //console.log(document.getElementById(tableId));
                    $('#'+tableId,).dataTable( {
                    aaSorting: [],
                    sScrollX:"100%",
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

                //console.log('DATATABLE ENABLED')

            }
        }
    }

    req.open('POST', '/ajaxTable')
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")

    req.send('key="'+tableNum+'"&chartId="'+chartId+'"' +'"&interval="'+interval+'"&orderby="'+orderby+'"')

    return false
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
                            { width: 30, targets: 31 },

                                        ],
					fixedColumns : {//关键是这里了，需要第一列不滚动就设置1
	                    leftColumns : 2
	                }
                    } );


            }
        }
    }



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


function width() {

    console.log(document.body.style.width)
    console.log(document.body.style.max-width)
    getElementsByClassName(dataTables_scrollBody).style.width = "2000px";
}



// DEPRECATED
function pagination(data,nav){


    temp = '<div id='+nav+'></div>'

    $(data).after('<div class="pageidx" id='+nav.replace("#", "")+'></div>');
    var rowsShown = 10;
    var rowsTotal = $(data+' tbody tr').length;
    var numPages = rowsTotal/rowsShown;
    for(i = 0;i < numPages;i++) {
        var pageNum = i + 1;
        $(nav).append('<a href="#" onclick="return false;" rel="'+i+'">'+pageNum+'</a> ');
    }
    $(data+' tbody tr').hide();
    $(data+' tbody tr').slice(0, rowsShown).show();
    $(nav + ' a:first').addClass('active');
    $(nav + ' a').bind('click', function(){

        $(nav + ' a').removeClass('active');
        $(this).addClass('active');
        var currPage = $(this).attr('rel');
        var startItem = currPage * rowsShown;
        var endItem = startItem + rowsShown;
        $(data+' tbody tr').css('opacity','0.0').hide().slice(startItem, endItem).
        css('display','table-row').animate({opacity:1}, 300);
    });
};

function removeall(){

    var chartlist = document.getElementsByClassName('sndChart');

    for (var i = 0; i < chartlist.length; i++)
    {

        var tempid = chartlist[i].id

      if(null!=document.getElementById(chartlist[i].id.replace('chart','related'))){

          if($.fn.DataTable.isDataTable('#'+chartlist[i].id.replace('chart','related'))){
            $('#'+chartlist[i].id.replace('chart','related')).DataTable().destroy();
          }
          document.getElementById(chartlist[i].id.replace('chart','related')).innerHTML=''
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




function getChartData(stockcode,chartId){

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
                removeall()

                if(req.response.sampledata!=null){

                    document.getElementById(chartId).style.height = "600px"
                    // document.getElementById(chartId.replace('chart','info')).innerHTML='<a href ='getRelated>'+stockcode+'</span>'

                    if(chartId=='chartS'){
                        getRelated(chartId,stockcode);
                    }
                    search(req.response.sampledata.result,'merge',chartId)
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

    localStorage.setItem("checked_interval",q_interval);
    localStorage.setItem("checked_orderby",q_orderby);


}