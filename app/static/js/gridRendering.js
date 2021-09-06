let canvas_height = window.innerHeight * 9 / 10
let device_type = "non-mobile"

function headerAbbreviation(){

    document.getElementById("induce_signin").innerHTML=''
    document.getElementById("userinfo").innerHTML=''
}


// 화면사이즈가 resize 될때마다 실행되는 함수, 반응형 구현
function gridRender(){

    grid_field_stock = document.getElementById("grid_field_stock")
    grid_field_table  = document.getElementById("grid_field_table")
    button_height = 40

    device_type = window.innerWidth > 800 ? "non-mobile" : "mobile"
    console.log("gridRender...", device_type, window.innerWidth, window.innerHeight)

    if (device_type == "mobile"){
        canvas_height = window.innerHeight * 0.90
        headerAbbreviation()
        grid_field_table.style.width = Math.min(window.innerWidth, 2400) * 0.98 +'px'
        grid_field_table.style.height = canvas_height + 'px'

        grid_field_stock.style.width = Math.min(window.innerWidth, 2400) * 0.98 +'px'
        grid_field_stock.style.height = canvas_height + 'px'

        grid_field_summary.style.width = Math.min(window.innerWidth, 2400) * 0.98 +'px'
        grid_field_summary.style.height = canvas_height + 'px'

        grid_element_stocks = document.getElementsByClassName("grid_layer_b")

        for (let i = 0; i<=grid_element_stocks.length - 1; i++){
            grid_element_stocks[i].style.height = canvas_height * 0.16 + 'px'
        }

        button_group_table_mobile = document.getElementById("button_group_table_mobile")
        button_group_table_mobile.style.display = 'block'
        button_group_table_mobile.style.bottom = button_height * Math.round(canvas_height * 0.1/button_height) + 'px'

        button_group_table_non_mobile = document.getElementById("button_group_table_non_mobile")
        button_group_table_non_mobile.style.display = 'none'

        grid_field_table.style.display = "block"
        grid_field_stock.style.display = "none"
        grid_field_summary.style.display = "none"
    }

    else {
        canvas_height = window.innerHeight * 0.94
        grid_field_table.style.width = Math.min(window.innerWidth, 2400) + 'px'
        grid_field_table.style.height = canvas_height + 'px'

        grid_field_stock.style.width = window.innerWidth * 0.48 + 'px'
        grid_field_stock.style.height = canvas_height + 'px'

        grid_field_summary.style.width = window.innerWidth * 0.48 + 'px'
        grid_field_summary.style.height = canvas_height + 'px'

        grid_element_stocks = document.getElementsByClassName("grid_layer_b")

        for (let i = 0; i<=grid_element_stocks.length - 1; i++){
            grid_element_stocks[i].style.height = canvas_height * 0.15 + 'px'
        }

        button_group_table_non_mobile = document.getElementById("button_group_table_non_mobile")
        button_group_table_non_mobile.style.display = 'block'
        button_group_table_non_mobile.style.bottom = button_height * Math.round(canvas_height * 0.1/button_height) + 'px'


        button_group_table_mobile = document.getElementById("button_group_table_mobile")
        button_group_table_mobile.style.display = 'none'

        grid_field_table.style.display = "inline-block"
        grid_field_stock.style.display = "none"
        grid_field_summary.style.display = "none"
    }

    button_group_stock_mobile = document.getElementById("button_group_stock_mobile")
    button_group_stock_mobile.style.display = 'block'
    button_group_stock_mobile.style.bottom = button_height * Math.round(canvas_height * 0.1/button_height) + 'px'

    button_group_summary_mobile = document.getElementById("button_group_summary_mobile")
    button_group_summary_mobile.style.display = 'block'
    button_group_summary_mobile.style.bottom = button_height * Math.round(canvas_height * 0.1/button_height) + 'px'


}



function toggleTableAndStock(){

    grid_field_stock = document.getElementById("grid_field_stock")
    grid_field_table  = document.getElementById("grid_field_table")
    grid_field_summary = document.getElementById("grid_field_summary")

    if (device_type == "mobile"){

        if (grid_field_table.style.display=="block"){

        // console.log("SHOW GRID_FIELD_STOCK")

        grid_field_table.style.display="none"
        grid_field_stock.style.display="block"

        }
        else {
            // console.log("SHOW GRID_FIELD_TABLE")
            grid_field_table.style.display="block"
            grid_field_stock.style.display="none"
        }



    }
    else if (device_type == "non-mobile"){


        if (grid_field_stock.style.display=="inline-block" || grid_field_summary.style.display == 'inline-block'){

            // 확장
            grid_field_table.style.display="inline-block"
            grid_field_stock.style.display="none"
            grid_field_table.style.width = Math.min(window.innerWidth, 2400) + 'px'
            grid_field_summary.style.display= "none"
        }


        else {

            // 축소
            grid_field_table.style.display="inline-block"
            grid_field_stock.style.display="inline-block"
            grid_field_table.style.width = window.innerWidth * 0.48 + 'px'
            grid_field_summary.style.display= "none"

        }
    }



}


function toggleStockAndSummary(){

    grid_field_stock = document.getElementById("grid_field_stock")
    grid_field_summary = document.getElementById("grid_field_summary")

    console.log(grid_field_summary.style.display)

    if (device_type == "mobile"){

        if (grid_field_summary.style.display=="block"){

            console.log("SHOW GRID_FIELD_STOCK")

            grid_field_summary.style.display="none"
            grid_field_stock.style.display="block"

        }
        else {


            console.log("SHOW GRID_FIELD_SUMMARY")
            grid_field_summary.style.display="block"
            grid_field_stock.style.display="none"

        }

    }
    else if (device_type == "non-mobile"){

        if (grid_field_summary.style.display=="inline-block"){

            console.log("SHOW GRID_FIELD_STOCK")

            grid_field_summary.style.display="none"
            grid_field_stock.style.display="inline-block"

        }
        else {


            console.log("SHOW GRID_FIELD_SUMMARY")
            grid_field_summary.style.display="inline-block"
            grid_field_stock.style.display="none"

        }

    }





}


function removeGridStockElementChart(element_id){

    stockcode_to_delete = document.getElementById(element_id).value

    element = document.getElementById(element_id)
    prev_chart = echarts.init(element)
    prev_chart.clear()


    element.removeAttribute('_echarts_instance_')
    document.getElementById(element_id).innerHTML='undefined'

    document.getElementById(element_id).style.color='#D6D6D6'
    document.getElementById(element_id).value=undefined

    return stockcode_to_delete
}

function removeGridStockElement(element_id, render=true){

    element = document.getElementById(element_id)

    stockcode_to_delete = removeGridStockElementChart(element_id)

    delete stockMap[stockcode_to_delete]


    idx = stockQueue.indexOf(stockcode_to_delete);
    stockQueue.splice(idx, 1);

    if (render==true){
        queueRender(true)
    }
}



const heightOutput = document.querySelector('#height');
const widthOutput = document.querySelector('#width');

function reportWindowSize() {
  console.log(window.innerWidth, 'x', window.innerHeight)
  gridRender()
}
