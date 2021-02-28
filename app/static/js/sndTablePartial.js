function hideColumnPartial(tableId){
    table = $('#' + tableId).DataTable();
    var column_idx_to_hide = [8, 9, 14, 15, 20, 21,
                                    22,23,24,25,26,27,
                                    28,29,30,31,32,33];
    for (idx in column_idx_to_hide){
        var column = table.column(column_idx_to_hide[idx]);
        column.visible( ! column.visible() );
    }
}

function conditionalFormattingPartial(row, data, stockcode_favorite){

    // ["002350_넥센타이어", "N", "7.637600", "7820", "3.710000", "17.420000", "27.990000", "39.150000", "33.220000", "11.710000", "0.640000", "3.600000", "3.030000", "-0.010000", "-0.710000", "-8.450000", "-0.160000", "0.100000", "0.310000", "-0.240000", "-0.320000", "-14.510000", "5", "429", "487", "416", "68", "3", "UDMDMUUU", "11.000000", "8.000000", "7.000000", "3.000000", "0.295000", "0.190000", "0.169000", "0.170000", "1.079000", "1.035000", "0.680000", "0.419000", "-1.000000", "-1.000000", "None", "완성차/타이어", "1970-01-01"]
    // ["002350_넥센타이어", "N", "7.637600", "7820", "3.710000", "17.420000", "27.990000", "39.150000", "33.220000", "11.710000", "0.640000", "3.600000", "3.030000", "-0.010000", "-0.710000", "-8.450000", "-0.160000", "0.100000", "0.310000", "-0.240000", "-0.320000", "-14.510000", "5", "429", "487", "416", "68", "3", "UDMDMUUU", "11.000000", "8.000000", "7.000000", "3.000000", "0.295000", "0.190000", "0.169000", "0.170000", "1.079000", "1.035000", "0.680000", "0.419000", "-1.000000", "-1.000000", "None", "완성차/타이어", "1970-01-01"]
    // 즐겨찾기 종목 체크박스 만들고 색칠하기
    var stockcode_stockname = data[0].split("_")
    stockcode = stockcode_stockname[0]
    stockname = stockcode_stockname[1]

    title = '<div id="table_daily_stockcode_'+stockcode+'" style=""><a href="#" onclick="getChartData(' + "'"  + stockcode +"','" + stockname + "');\">" + stockname + '</a></div>'
    $('td:eq('+0+')', row).html(title)
    $('td:eq('+0+')', row).css('background-color', '#ffffff')
    $('td:eq('+1+')', row).html('<input type="checkbox" onchange="handleChange(this)" value="'+ stockcode +'">')

    if (stockcode_favorite.includes(stockcode)){
        $('td:eq('+0+')', row).css('background-color', '#eac112')
        $('td:eq('+1+')', row).html('<input type="checkbox" onchange="handleChange(this)" value="'+ stockcode +'" checked>')
    }


    for (var i = 4; i < 16; i++){
        for (color in profit_map){


            if (data[i] >= profit_map[color][1] && data[i] < profit_map[color][0]){
                 $('td.col'+i, row).css('background-color', profit_map[color][2])
                break
            }
        }
    }

    for (var i = 16; i < 18; i++){
        for (color in rank_map){

            if (data[i] >= rank_map[color][1] && data[i] < rank_map[color][0]){
                $('td.col'+i, row).css('background-color', rank_map[color][2])
                break
            }
        }
    }

    for (var i = 23; i < 27; i++){
        for (color in bbw_map){

            if (data[i] >= bbw_map[color][1] && data[i] < bbw_map[color][0]){
                $('td.col'+i, row).css('background-color', bbw_map[color][2])
                break
            }
        }
    }


    for (var i = 27; i < 31; i++){
        for (color in bbp_map){

            if (data[i] >= bbp_map[color][1] && data[i] < bbp_map[color][0]){
                $('td.col'+i, row).css('background-color', bbp_map[color][2])
                break
            }
        }
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
        autoWidth:false,
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
                null, null, null, null, null, null
            ],
        columnDefs: [

                // { type: 'natural', targets: '_all'},

                { orderSequence: [ "desc", "asc"],
                  targets: [ 2,3,
                                4,  5,  6,  7,
                                8,  9,  10, 11,
                                12, 13, 14, 15,

                                16, 17,
                                18,
                                19, 20, 21, 22,
                                23, 24, 25, 26,
                                27, 28, 29, 30,
                                31, 32, 33,
                                34, 35
                                ] },
                // STOCKNAME


                { width: 70, targets: 0 },

                // FAV
                { width: 20, targets: 1},

                // MC
                { width: 30, targets: 2, render: $.fn.dataTable.render.number(',', '.', 1, '')},

                // CLOSE
                { width: 45, targets: 3, render: $.fn.dataTable.render.number( ',', '.', 0, '')},

                // P I F
                { width: 30, targets: [4,5,6,7, 8,9,10,11, 12,13,14,15] , render: $.fn.dataTable.render.number(',', '.', 2, '')},

                // RANK
                { width: 30, targets: [16, 17] },

                // EVENT PATTERN
                { width: 90, targets: 18 },

                // DAYS EVENT
                { width: 30, targets: [19, 20, 21, 22] , render: $.fn.dataTable.render.number(',', '.', 0, '')},

                // BBP EVENT
                { width: 30, targets: [23, 24, 25, 26] , render: $.fn.dataTable.render.number(',', '.', 2, '')},

                // BBW EVENT
                { width: 30, targets: [27, 28, 29, 30] , render: $.fn.dataTable.render.number(',', '.', 2, '')},

                // FINAN
                { width: 30, targets: [31, 32, 33] , render: $.fn.dataTable.render.number(',', '.', 2, '')},

                // CATEGORY
                { width: 200, targets: [34] },

                { width: 60, targets: [35] }
        ],

        scrollCollapse: true,
        fixedColumns : {//关键是这里了，需要第一列不滚动就设置1
            leftColumns : 3
        },


        rowCallback: function( row, data ) {
            conditionalFormattingPartial(row, data, stockcode_favorite) // Conlorize + Modify inner cell value

        }

    } );

    console.log(' * Table rendering DONE', now())
    // hideColumn(tableId)
    var table = $('#'+tableId).DataTable();
    $('#mc_min, #mc_max').on("keyup input change propertychange", function() {
        table.draw()
    } );

}