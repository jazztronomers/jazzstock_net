function conditionalFormatting(row, data, column_list, stockcode_favorite){


    var stockcode_stockname = data[0].split("_")
    stockcode = stockcode_stockname[0]
    stockname = stockcode_stockname[1]



    if (stockcode_favorite.includes(stockcode)){
        $('td:eq('+0+')', row).css('background-color', '#eac112')
        // $('td:eq('+1+')', row).html('<input type="checkbox" onchange="handleChange(this)" value="'+ stockcode +'" checked>')
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




function renderTable(tableId, response, columnList){

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
        //fixedHeader: true,
        columnDefs: getColumnDefs(columnList),
        scrollCollapse: true,
        fixedColumns : {//关键是这里了，需要第一列不滚动就设置1
            leftColumns : 3
        },
        colReorder: {
            enable: true,
            realtime: true,
            fixedColumnsLeft: 3,

        },
        rowCallback: function( row, data ) {
            conditionalFormatting(row, data, columnList, stockcode_favorite) // Conlorize + Modify inner cell value
        },

        initComplete: function( settings, json ) {

            // $("div.dataTables_scrollBody").animate({ scrollLeft: 400 }, 1000);
            // $("div.dataTables_scrollBody").animate({ scrollLeft: 400 }, 100);

        }



    } );

    $('#'+tableId).on('dblclick', 'td', function () {
        var tr = $(this).closest('tr');
        var row = table.row( tr );

        if ($(tr).css('font-weight')==400){
            $(tr).css('font-weight', 800)
            $(tr).css('border-bottom','1.5pt')
        }
        else {
            $(tr).css('font-weight', 400)
            $(tr).css('border-bottom','1pt')

        }
    } );

    console.log(' * Table rendering done', now())
    // hideColumn(tableId)
    var table = $('#'+tableId).DataTable();
    $('#mc_min, #mc_max').on("keyup input change propertychange", function() {
        table.draw()
    } );


    $('a.toggle-vis').on( 'click', function (e) {
        e.preventDefault();

        // Get the column API object
        var column = table.column( $(this).attr('data-column') );

        // Toggle the visibility
        column.visible( ! column.visible() );
    } );

}




