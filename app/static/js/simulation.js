function renderSimulationTab(){

    getAllFeaturesForSimulation()
    renderRecentTradingDays()
    renderConditionGenerationArea()
    getConditionSetsFromServer()
    // getSpecificFeatureStats()

}


let condition_queue = []
let features_map = {}
let feature_type_list = []
let simulation_result = undefined
let simulation_result_object = undefined
let simulation_result_html = undefined
let simulation_result_column_list = undefined
let simulation_is_running = false


let finan_quarter_map = ["3Q21", "2Q21", "1Q21",
                         "4Q20", "3Q20", "2Q20", "1Q20",
                         "4Q19", "3Q19", "2Q19", "1Q19",
                         "4Q18", "3Q18", "2Q18", "1Q18",
                         "4Q17", "3Q17", "2Q17", "1Q17"]


function getAllFeaturesForSimulation(){
    /*
    *     선택할 수 있는 모든 feature를 가져오는 함수, config_table_specification.py를 전적으로 참조한다
    */


    // LAZY LOAD
    for (let i=0; i < column_spec_list.length; i++){
        if ("simulation_feature_yn" in column_spec_list[i] && column_spec_list[i].simulation_feature_yn==1){
            if("column_childs" in column_spec_list[i]){
                for (let j=0; j < column_spec_list[i].column_childs.length; j++){
                    features_map[column_spec_list[i].column_childs[j]] = column_spec_list[i]
                }
            }

            else{
                features_map[column_spec_list[i].column_name] = column_spec_list[i]

            }
            if (!feature_type_list.includes(column_spec_list[i].simulation_feature_type)){
                feature_type_list.push(column_spec_list[i].simulation_feature_type)
            }
        }
    }


    renderAllFeatures()


}


function renderAllFeatures(finan_only=false){
    /*
    *     가져온 모든 features를 화면에다 버튼으로 뿌리는 함수
    */

    simulation_condition_feature_menu_tbody = document.getElementById("simulation_condition_feature_menu_tbody")

    while (simulation_condition_feature_menu_tbody.firstChild){
        simulation_condition_feature_menu_tbody.removeChild(simulation_condition_feature_menu_tbody.lastChild)
    }


    for (let i=0; i< feature_type_list.length; i++){

        let row = document.createElement("tr")
        let cell_a = document.createElement("td")
        let cell_b = document.createElement("td")

        cell_a.innerHTML=feature_type_list[i]

        for (feature_name in features_map){
            if(features_map[feature_name].simulation_feature_type==feature_type_list[i]){
                let cell_b_content =document.createElement("button")
                cell_b_content.innerHTML= feature_name

                if (features_map[feature_name].column_name_short != undefined & features_map[feature_name].column_name_full != undefined){
                    feature_name_full = feature_name.replace(features_map[feature_name].column_name_short, features_map[feature_name].column_name_full)
                    cell_b_content.setAttribute("feature_name", feature_name)
                    cell_b_content.setAttribute("feature_name_full", feature_name_full)
                }
                else {
                    feature_name_full = feature_name
                    cell_b_content.setAttribute("feature_name", feature_name)
                    cell_b_content.setAttribute("feature_name_full", feature_name)
                }


                if (finan_only==true & feature_type_list[i] != 'FINAN'){
                    cell_b_content.disabled = true
                }

                cell_b_content.setAttribute("class", "button_simulation_features")
                cell_b_content.setAttribute("onclick","addConditionInputRow('"+ feature_name +"','" + feature_name_full + "')")
                cell_b.appendChild(cell_b_content)
            }
        }

        row.appendChild(cell_a)
        row.appendChild(cell_b)
        simulation_condition_feature_menu_tbody.appendChild(row)

    }



}

function renderConditionGenerationArea(){

//    simulation_condition_generation_area = document.getElementById("simulation_condition_generation_area")
//
//    while (simulation_condition_generation_area.firstChild){
//        simulation_condition_generation_area.removeChild(simulation_condition_generation_area.lastChild)
//    }
//    let table = document.createElement("table")
//
//
//
//    let thead = document.createElement("thead")
//
//
//
//
//    let tbody = document.createElement("tbody")
//    tbody.setAttribute("id","simulation_condition_generation_tbody")
//
//    table.appendChild(thead)
//    table.appendChild(tbody)
//
//
//    simulation_condition_generation_area.appendChild(table)

}

function getConditionInputRowId(){

    id = "condition_row_" + condition_queue.length
    condition_queue.push(id)

    return id

}

function addConditionInputRow(feature_name, feature_name_full, preset_operation=null, preset_target_value=null){
    /*
     *    feature selection area에서 단일 feature 버튼을 클릭하면
     *    condition generation area에 feature가 줄로 추가됨
     *    1.최초 feature 편집 줄을 추가
     *    2. 서버사이드 또는 로컬스토리지에서 불러온 condition set을 rendering
     *
     *    할때 호출되는 함수
     */


    row_id = getConditionInputRowId()
    // console.log('addConditionInputRow:', feature_name, feature_name_full, preset_operation, preset_target_value)

    simulation_condition_generation_tbody = document.getElementById("simulation_condition_generation_tbody")

    // deafault cell 삭제
    simulation_condition_generation_tbody.childNodes.forEach(c=>{
    if(c.className  == 'table_default_row_while_empty'){
        simulation_condition_generation_tbody.removeChild(c);
    }})


    let row = document.createElement("tr")
    row.setAttribute("id", row_id)

    let cell_a = document.createElement("td") // feature_name
    let cell_b = document.createElement("td") // operation
    let cell_c = document.createElement("td") //
    let cell_d = document.createElement("td") // target_value
    cell_a.setAttribute("id", row_id+"_cell_a")
    cell_b.setAttribute("id", row_id+"_cell_b")
    cell_c.setAttribute("id", row_id+"_cell_c")
    cell_d.setAttribute("id", row_id+"_cell_d")

    cell_a.innerHTML=feature_name
    cell_a.setAttribute("feature_name", feature_name)
    cell_a.setAttribute("feature_name_full", feature_name_full)

    button_get_distribution =document.createElement("button")
    button_get_distribution.innerHTML= "info."
    button_get_distribution.setAttribute("class", "button_simulation_input")
    button_get_distribution.setAttribute("onclick", "getDistribution('"+feature_name_full+"')")

    button_delete =document.createElement("button")
    button_delete.innerHTML= "delete"
    button_delete.setAttribute("class", "button_simulation_input")
    button_delete.setAttribute("onclick","deleteRow('"+row_id+"')")

    cell_a.appendChild(button_get_distribution)
    cell_a.appendChild(button_delete)

    // ======================================================================================

    select_box_operation = document.createElement("select")

    const operations = [">", ">=", "=", '<', "<="];
    for (let operation of operations) {
        option = document.createElement("option")
        option.value = operation
        option.innerHTML = operation


        if (operation == preset_operation){
            option.setAttribute("selected",true)
        }
        else if (operation == ">"){
            option.setAttribute("selected",true)
        }
        select_box_operation.appendChild(option)
    }
    cell_b.appendChild(select_box_operation)


    // ======================================================================================

    select_box_target = document.createElement("select")


    const targets = ["value", "feature"];
    for (let target of targets) {
        option = document.createElement("option")
        option.value = target
        option.innerHTML = target
        if(target =="value"){
            option.setAttribute("selected", true)
        }
        select_box_target.appendChild(option)
    }

    select_box_target.setAttribute("onchange","changeTargetInputArea(this.value, '"+ row_id + "', '" + preset_target_value + "')")
    cell_c.appendChild(select_box_target)

    // ======================================================================================




    row.appendChild(cell_a)
    row.appendChild(cell_b)
    row.appendChild(cell_c)
    row.appendChild(cell_d)

    simulation_condition_generation_tbody.appendChild(row)

    // 초기화할때 한번 돌려줌
    changeTargetInputArea("value", row_id, preset_target_value)

}

function deleteRow(row_id){



    let row = document.getElementById(row_id);
    row.parentNode.removeChild(row);

    // SHOW DEFAULT VALUE WHILE EMPTY
    simulation_condition_generation_tbody = document.getElementById("simulation_condition_generation_tbody")
    if (simulation_condition_generation_tbody.firstElementChild == null){

        tr = document.createElement('tr')
        tr.setAttribute("class", "table_default_row_while_empty")

        td = document.createElement('td')
        td.setAttribute("colspan", "4")
        td.setAttribute("class", "table_default_cell_while_empty")
        td.innerHTML="ADD FEATURES FROM LEFT FEATURE MENU !"

        tr.appendChild(td)
        simulation_condition_generation_tbody.appendChild(tr)
    }






}

function changeTargetInputArea(target, row_id, preset_target_value=null) {

    cell_d = document.getElementById(row_id + "_cell_d")

    while (cell_d.firstChild){
        cell_d.removeChild(cell_d.lastChild)
    }



    if (target == "feature"){
        target_value_coeff = document.createElement("input")
        target_value = document.createElement("select")

        console.log(features_map)

        for (feature in features_map){
            let option = document.createElement("option")
            option.innerHTML= feature
            option.value= feature
            target_value.appendChild(option)
        }

        cell_d.appendChild(target_value_coeff)
        cell_d.appendChild(target_value)
    }

    else if (preset_target_value != null){
        target_value = document.createElement("input")
        target_value.value = preset_target_value
        cell_d.appendChild(target_value)
    }


    else if (target == "value"){
        target_value = document.createElement("input")
        cell_d.appendChild(target_value)
    }
}



function simulationRequest(){

    if (simulation_is_running == true){

        alert("simulation이 실행중입니다, 잠시뒤 다시 시도해주세요")
    }

    else {



        condition_set = getConditionSetCurrent()
        from_date = document.getElementById('simulation_from_date').value
        to_date = document.getElementById('simulation_to_date').value

        if (condition_set != false && from_date != undefined && to_date != undefined) {

            let req = new XMLHttpRequest()
            req.responseType = 'json';
            req.onreadystatechange = function()
            {
                if (req.readyState == 4)
                {
                    if (req.status != 200)
                    {
                        alert('simulationRequest ERROR!')
                    }
                    else
                    {

                        if (req.response.result == false){

                                alert(req.response.message)
                        }

                        else {


                            if (finan_only == true) {

                                simulation_result_html = req.response.simulation_result_table_html
                                simulation_result_column_list = req.response.simulation_result_column_list
                                simulation_result = req.response.simulation_result_table_json

                                simulation_result_object = parseSimulationResult(simulation_result, true)

                                if (simulation_result_object == false){

                                    alert("조건에 부합하는 종목이 없습니다")

                                }

                                else {

                                    setSimulationResultsFinanOnly()
                                    renderSimulationResultTable("RAW_FINAN_ONLY")
                                    renderSimulationResultScatterPlot()

                                }
                            }

                            else {

                                simulation_result_html = req.response.simulation_result_table_html
                                simulation_result_column_list = req.response.simulation_result_column_list
                                simulation_result = req.response.simulation_result_table_json
                                setFeaturesToLocalStorage(JSON.stringify(condition_set), from_date, to_date)
                                simulation_result_object = parseSimulationResult(simulation_result)

                                if (simulation_result_object == false){

                                    alert("조건에 부합하는 종목이 없습니다")

                                }

                                else {

                                    setSimulationResults()
                                    renderSimulationResultTable("RAW")
                                    renderSimulationResultScatterPlot()

                                }

                            elapsed_time = req.response.elapsed_time
                            console.log('simulationRequest elapsed time: ', elapsed_time)
                        }
                        simulation_is_running = false
                        // renderTable("table_simulation", html, column_list, ratio=0.5, fixedLeft=2)

                        }
                    }
            }
        }


            if (document.getElementById('simulation_finan_only').checked){
                finan_only = true
            }
            else if (isFinanOnlyConditons(condition_set)){
                finan_only = true
            }

            else {
                finan_only = false
            }

            features = JSON.stringify({"condition_set":condition_set, "from_date":from_date, "to_date":to_date, "finan_only":finan_only})
            req.open('POST', '/getSimulationResult')
            req.setRequestHeader("Content-type", "application/json")
            req.send(features)
            simulation_is_running=true
            alert("simulation이 요청되었습니다, 잠시만 기다려주세요")

        }

        else {
            alert("input이 정확하지 않습니다")
        }

    }
}

function isFinanOnlyConditons(condition_set){

    for (let i=0; i<condition_set.length; i++){
        if (features_map[condition_set[i].feature_name].simulation_feature_type != "FINAN"){
            return false
        }
    }

    alert("finan 지표만 선택되어 가장최근 분기기준 finan_only 시뮬레이션으로 결과가 생성됩니다. 다른분기도 확인하고 싶으시다면 finan_only체크박스 체크후 기간을 늘려보시기 바랍니다")
    return true

}

function parseSimulationResult(simulation_result, finan_only=false){


    //grp = df.groupby("QUARTER").agg({"PERIOD_FLUCTUATION":"mean"}).print()

    if (simulation_result.length == 0){

        return false
    }

    else if (finan_only==true){

        let df = new dfd.DataFrame(simulation_result)
        // df = df.astype({column: ("PERIOD_FLUCTUATION"), dtype: "float"})
        grp = df.groupby(["QUARTER"]).agg({"PERIOD_FLUCTUATION":"mean", "STOCKNAME":"count"})

        qq_columns = grp.column_names
        qq_data = grp.data
        grp.print()



        simulation_result_col_data_grouped = {}
        for (let i=0; i<grp.QUARTER.data.length; i++){

            key_quarter = grp.QUARTER.data[i]
            value_coldata = df.query({ "column": "QUARTER", "is": "==", "to": key_quarter }).col_data

            simulation_result_col_data_grouped[key_quarter] = value_coldata
        }



        console.log(simulation_result_col_data_grouped)

        return {"simulation_result_raw":simulation_result,
                "simulation_result_columns":strArrayAllElementsToUpperCase(df.column_names),
                "simulation_result_row_data":df.data,
                "simulation_result_col_data":df.col_data,
                // "simulation_result_col_data":df.col_data, // => 이놈을 GROUP BY 기준으로 MAP 형태로 변경해야 함
                "simulation_result_col_data_grouped":simulation_result_col_data_grouped,
                "simulation_result_qq_summary_columns":strArrayAllElementsToUpperCase(qq_columns),
                "simulation_result_qq_summary_row_data":qq_data
                }


    }

    else if (finan_only==false){



        let df = new dfd.DataFrame(simulation_result)
        df = df.astype({column: ("YY","MM"), dtype: "string"})

        console.log(simulation_result)
        console.log(df.column_names)

        grp = df.groupby(["YY", "MM"]).agg({"PRO1":"mean","PRO3":"mean", "PRO5":"mean", "PRO10":"mean", "PRH1":"mean","PRH3":"mean", "PRH5":"mean", "PRH10":"mean", "STOCKCODE":"count"})
        mm_columns = grp.column_names
        mm_data = grp.data
        grp.print()

        grp = df.groupby(["YY"]).agg({"PRO1":"mean","PRO3":"mean", "PRO5":"mean", "PRO10":"mean", "PRH1":"mean","PRH3":"mean", "PRH5":"mean", "PRH10":"mean", "STOCKCODE":"count"})
        yy_columns = grp.column_names
        yy_data = grp.data
        grp.print()

        grp = df.groupby(["YY"]).agg({"BBP":"mean","BBW":"mean", "PMA5":"mean", "VMA5":"mean"})
        // yy_columns = grp.column_names
        // yy_data = grp.data
        grp.print()

        grp = df.groupby(["YY"]).agg({"BBP":"std","BBW":"std", "PMA5":"std", "VMA5":"std"})
        // yy_columns = grp.column_names
        // yy_data = grp.data
        grp.print()




        return {"simulation_result_raw":simulation_result,
                "simulation_result_columns":strArrayAllElementsToUpperCase(df.column_names),
                "simulation_result_row_data":df.data,
                "simulation_result_col_data":df.col_data, // => 이놈을 GROUP BY 기준으로 MAP 형태로 변경해야 함
                "simulation_result_mm_summary_columns":strArrayAllElementsToUpperCase(mm_columns),
                "simulation_result_mm_summary_row_data":mm_data,
                "simulation_result_yy_summary_columns":strArrayAllElementsToUpperCase(yy_columns),
                "simulation_result_yy_summary_row_data":yy_data,
                }
    }
}

function setSimulationResults(){

    // global simulation_result_object

    select_box = document.getElementById("simulation_row_results_table_select")
    select_box.setAttribute("onchange", "renderSimulationResultTable(this.value)")

    removeAllChildOfElement(select_box)

    opt = document.createElement("option")
    opt.value = "YEAR"
    opt.innerHTML = "YEAR"
    select_box.appendChild(opt)


    opt = document.createElement("option")
    opt.value = "MONTH"
    opt.innerHTML = "MONTH"
    select_box.appendChild(opt)


    opt = document.createElement("option")
    opt.value = "RAW"
    opt.innerHTML = "RAW"
    select_box.appendChild(opt)

    // ------------------------------------------------------------------------------

    select_box_x = document.getElementById("simulation_row_results_scatter_select_x")
    select_box_x.setAttribute("onchange", "renderSimulationResultScatterPlot()")

    removeAllChildOfElement(select_box_x)

    for (let each of ['BBW', 'BBP', 'ROE', 'PER', 'PBR','ROE',
                    "EPS_YOY", "EPS_QOQ", "BPS_YOY", "BPS_QOQ",
                    'IR','FR',
                    'PMA5', 'PMA20', 'PMA60', 'PMA120', 'VMA5', 'VMA20', 'VMA60', 'VMA120',
                    'I1', 'I5','I20', 'F1', 'F5', 'F20',]){
        opt = document.createElement("option")
        opt.value = each
        opt.innerHTML = each
        select_box_x.appendChild(opt)
    }


    select_box_y = document.getElementById("simulation_row_results_scatter_select_y")
    select_box_y.setAttribute("onchange", "renderSimulationResultScatterPlot()")

    removeAllChildOfElement(select_box_y)


    opt = document.createElement("option")
    opt.value = "PRO10"
    opt.innerHTML = "PRO10"
    select_box_y.appendChild(opt)

    opt = document.createElement("option")
    opt.value = "PRO5"
    opt.innerHTML = "PRO5"
    select_box_y.appendChild(opt)



}



function setSimulationResultsFinanOnly(){

    // global simulation_result_object

    select_box = document.getElementById("simulation_row_results_table_select")
    select_box.setAttribute("onchange", "renderSimulationResultTable(this.value)")

    removeAllChildOfElement(select_box)

    opt = document.createElement("option")
    opt.value = "RAW_FINAN_ONLY"
    opt.innerHTML = "RAW_FINAN_ONLY"
    select_box.appendChild(opt)

    select_box_x = document.getElementById("simulation_row_results_scatter_select_x")
    select_box_x.setAttribute("onchange", "renderSimulationResultScatterPlot()")

    removeAllChildOfElement(select_box_x)

    for (let each of ['PER','PBR','ROE','EPS_YOY','EPS_QOQ','BPS_YOY','BPS_QOQ']){
        opt = document.createElement("option")
        opt.value = each
        opt.innerHTML = each
        select_box_x.appendChild(opt)
    }


    select_box_y = document.getElementById("simulation_row_results_scatter_select_y")
    select_box_y.setAttribute("onchange", "renderSimulationResultScatterPlot()")

    removeAllChildOfElement(select_box_y)


    opt = document.createElement("option")
    opt.value = "PERIOD_FLUCTUATION"
    opt.innerHTML = "PERIOD_FLUCTUATION"
    select_box_y.appendChild(opt)



}


function removeAllChildOfElement(element){

    while (element.firstChild){
            element.removeChild(element.lastChild)
    }
}


function renderSimulationResultTable(label){

    // global simulation_result_object
    simulation_row_results_table_content = document.getElementById("simulation_row_results_table_content")
    removeAllChildOfElement(simulation_row_results_table_content)

    // console.log(simulation_result_object.simulation_result_raw)
    table = document.createElement('table')
    table.setAttribute("id","simulation_row_results_table")
    table.style.width="100%"
    thead = document.createElement('thead')
    thead.setAttribute("id","simulation_row_results_table_thead")

    tbody = document.createElement('tbody')
    tbody.setAttribute("id","simulation_row_results_table_tbody")


    table.appendChild(thead)
    table.appendChild(tbody)
    simulation_row_results_table_content.appendChild(table)

    if(label=="YEAR"){


        column_list = simulation_result_object.simulation_result_yy_summary_columns
        h_tr = document.createElement("tr")
        for (let each_col of simulation_result_object.simulation_result_yy_summary_columns) {
            th = document.createElement("th")
            th.innerHTML = each_col
            h_tr.appendChild(th)
        }
        thead.appendChild(h_tr)




        for (let each_line of simulation_result_object.simulation_result_yy_summary_row_data) {
            b_tr = document.createElement("tr")
            for (let each_col of each_line) {
                td = document.createElement("td")
                td.innerHTML = each_col
                b_tr.appendChild(td)
            }
            tbody.appendChild(b_tr)
        }

        renderTable("simulation_row_results_table", null, column_list, ratio=0.9)

    }
    else if(label=="MONTH"){

        column_list = simulation_result_object.simulation_result_mm_summary_columns
        h_tr = document.createElement("tr")
        for (let each_col of simulation_result_object.simulation_result_mm_summary_columns) {
            th = document.createElement("th")
            th.innerHTML = each_col
            h_tr.appendChild(th)
        }
        thead.appendChild(h_tr)

        for (let each_line of simulation_result_object.simulation_result_mm_summary_row_data) {
            b_tr = document.createElement("tr")
            for (let each_col of each_line) {
                td = document.createElement("td")
                td.innerHTML = each_col
                b_tr.appendChild(td)
            }
            tbody.appendChild(b_tr)
        }

        renderTable("simulation_row_results_table", null, column_list, ratio=0.4)
    }
    else if(label=="RAW"){

        renderTable("simulation_row_results_table", simulation_result_html, simulation_result_column_list, ratio=0.2, fixedLeft=3, markdate_yn=true)
    }


    else if(label=="RAW_FINAN_ONLY"){

        renderTable("simulation_row_results_table", simulation_result_html, simulation_result_column_list, ratio=0.2, fixedLeft=3, markdate_yn=true)
    }
//    table = document.getElementById("simulation_row_results_table_table")
//    if(table.className.includes("dataTable")){
//        clearTable("simulation_row_results_table_table")
//    }




}



function renderSimulationResultScatterPlot(){

    x = document.getElementById("simulation_row_results_scatter_select_x").value
    y = document.getElementById("simulation_row_results_scatter_select_y").value

    x_idx = simulation_result_object.simulation_result_columns.indexOf(x)
    y_idx = simulation_result_object.simulation_result_columns.indexOf(y)

    removeAllChildOfElement(document.getElementById("simulation_row_results_scatter_content"))

    // global simulation_result_object


    let data = []
    if (simulation_result_object.simulation_result_col_data_grouped == undefined){

        let trace1 = {
          x: simulation_result_object.simulation_result_col_data[x_idx],
          y: simulation_result_object.simulation_result_col_data[y_idx],
          mode: 'markers+text',
          type: 'scatter',
          textposition: 'top center',
          textfont: {
            family:  'Raleway, sans-serif'
          },
          marker: { size: 12 }
        };


        data = [ trace1];
    }


    else {
        for (let quarter in simulation_result_object.simulation_result_col_data_grouped){
            data.push({
              name: quarter,
              x: simulation_result_object.simulation_result_col_data_grouped[quarter][x_idx],
              y: simulation_result_object.simulation_result_col_data_grouped[quarter][y_idx],
              text: simulation_result_object.simulation_result_col_data_grouped[quarter][1],
              mode: 'markers',
              type: 'scatter',
              textposition: 'top center',
              textfont: {
                family:  'Raleway, sans-serif'
              },
              marker: { size: 12 }
            })
        }


    }

    let layout = {
        xaxis: {
            range: [ Math.min(simulation_result_object.simulation_result_col_data[x_idx]),
                     Math.max(simulation_result_object.simulation_result_col_data[x_idx]) ],
            title: x
        },
        yaxis: {
            range: [ Math.min(simulation_result_object.simulation_result_col_data[y_idx]),
                     Math.max(simulation_result_object.simulation_result_col_data[y_idx]) ],
            title: y
        },
//        margin: {
//            l: 40,
//            r: 40,
//            b: 40,
//            t: 40,
//            pad: 4
//        },
        legend: {
            y: 0.5,
            yref: 'paper',
            font: {
              family: 'Arial, sans-serif',
              size: 20,
              color: 'grey',
            }
        },
        autosize:true,
        // paper_bgcolor: "#B5C4CA", // RED
        plot_bgcolor: "#B5C4CA", // BLUE
        title: "scatter plot",
        dragmode: "pan"
    };

    Plotly.newPlot('simulation_row_results_scatter_content', data, layout, {scrollZoom: true});

    plot_div = document.getElementById('simulation_row_results_scatter_content')
    plot_div.on('plotly_selected', function(data_selected) {


        console.log(data_selected)

    });

    plot_div.on('plotly_click', function(data_clicked){

        // DATATABLES 과 연동하거나 ECHARTS와 연동
        console.log(data_clicked)

        var pts = '';
        for(var i=0; i < data.points.length; i++){
            annotate_text = 'x = '+data_clicked.points[i].x +
                          'y = '+data_clicked.points[i].y.toPrecision(4);

            annotation = {
              text: annotate_text,
              x: data.points[i].x,
              y: parseFloat(data.points[i].y.toPrecision(4))
            }

            annotations = self.layout.annotations || [];
            annotations.push(annotation);
            Plotly.relayout('myDiv',{annotations: annotations})
        }

    });

}




function setFeaturesToLocalStorage(feature_rows, from_date='2020-01-02', to_date='2021-07-23'){

    localStorage.setItem("jazzstock_recent_features_simulation", feature_rows)
    localStorage.setItem("jazzstock_from_date_simulation", from_date)
    localStorage.setItem("jazzstock_to_date_simulation", to_date)

}



function renderSpecificFeatureStats(feature_name, stats){


}



function renderRecentTradingDays(finan_only=false){

    select_box_from = document.getElementById("simulation_from_date")
    select_box_to = document.getElementById("simulation_to_date")

    while (select_box_from.firstChild){
        select_box_from.removeChild(select_box_from.lastChild)
    }


    while (select_box_to.firstChild){
        select_box_to.removeChild(select_box_to.lastChild)
    }

    removeAllChildOfElement(select_box_from)
    removeAllChildOfElement(select_box_to)

    if (finan_only == false){


        for (let i = 0; i < recent_trading_days.length; i++){

            option_from = document.createElement("option")
            option_from.value = recent_trading_days[i]
            option_from.innerHTML = recent_trading_days[i]


            if(recent_trading_days[i] == localStorage.getItem("jazzstock_from_date_simulation")){
                option_from.setAttribute("selected", true)
            }
            select_box_from.appendChild(option_from)

            option_to = document.createElement("option")
            option_to.value = recent_trading_days[i]
            option_to.innerHTML = recent_trading_days[i]
            select_box_to.appendChild(option_to)

            if(recent_trading_days[i] == localStorage.getItem("jazzstock_to_date_simulation")){
                option_to.setAttribute("selected", true)
            }
            select_box_to.appendChild(option_to)


        }
    }

    else {

        for (let i = 0; i < finan_quarter_map.length; i++){

            option_from = document.createElement("option")
            option_from.value = finan_quarter_map[i]
            option_from.innerHTML = finan_quarter_map[i]
            select_box_from.appendChild(option_from)

            option_to = document.createElement("option")
            option_to.value = finan_quarter_map[i]
            option_to.innerHTML = finan_quarter_map[i]
            select_box_to.appendChild(option_to)


        }
    }
}


function getDistribution(feature_name){

    from_date = document.getElementById('simulation_from_date').value
    to_date = document.getElementById('simulation_to_date').value

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


                console.log(req.response)

            }
        }
    }

    console.log()
    params = JSON.stringify({"feature_name":feature_name, "from_date":from_date, "to_date":to_date, "origin_table":features_map[feature_name].origin_table})
    req.open('POST', '/test')
    req.setRequestHeader("Content-type", "application/json")
    req.send(params)


}



function renderFeatures(condition_set){

    condition_set_name = condition_set.CONDITION_SET_NAME
    condition_set_description = condition_set.CONDITION_SET_DESCRIPTION
    feature_rows = JSON.parse(condition_set.CONDITION_SET_VALUE)

    simulation_condition_generation_tbody = document.getElementById("simulation_condition_generation_tbody")
    while (simulation_condition_generation_tbody.firstChild){
        simulation_condition_generation_tbody.removeChild(simulation_condition_generation_tbody.lastChild)
    }

    for (let i=0; i< feature_rows.length; i++){
        // console.log("renderFeatures...", feature_rows[i])
        addConditionInputRow(feature_rows[i].feature_name, feature_rows[i].feature_name_full, feature_rows[i].operation, feature_rows[i].target_value)
    }



    elm = document.getElementById("condition_set_name")
    elm.value=condition_set_name

    elm = document.getElementById("condition_set_description")
    elm.value=condition_set_description


}


function getConditionSetFromLocalStorage(){


    feature_rows = localStorage.getItem("jazzstock_recent_features_simulation")

    if (feature_rows == undefined){
        alert("no saved features on local storage")
    }

    else {
        console.log(feature_rows)
        renderFeatures(JSON.parse(feature_rows))
    }

}

function getConditionSetsFromServer(){

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
                renderConditionSets(req.response)
            }
        }
    }

    req.open('POST', '/getConditionSetsFromServer')
    req.setRequestHeader("Content-type", "application/json")
    req.send()

}

function renderConditionSets(response){

    tbody = document.getElementById("simulation_condition_list_tbody")


    while (tbody.firstChild){
        tbody.removeChild(tbody.lastChild)
    }

    condition_set = response.result


    for (let i = 0; i< condition_set.length; i++){

        row = document.createElement("tr")
        cell_name = document.createElement("td")
        cell_timestamp = document.createElement("td")
        cell_delete = document.createElement("td")

        condition_name = document.createElement('a')
        condition_name.innerHTML = condition_set[i].CONDITION_SET_NAME
        condition_name.value = condition_set[i]

        condition_name.setAttribute("href", "#")
        condition_name.setAttribute("onclick", "renderFeatures(this.value)")

        button_delete=document.createElement("button")
        button_delete.setAttribute("class", "button_in_a_cell")
        button_delete.innerHTML= "delete"
        button_delete.value = condition_set[i].CONDITION_SET_ID
        button_delete.setAttribute("onclick","deleteConditionOnServer(this.value)")


        cell_timestamp.innerHTML = condition_set[i].TIMESTAMP



        cell_name.appendChild(condition_name)
        cell_name.appendChild(button_delete)
        row.appendChild(cell_name)
        row.appendChild(cell_timestamp)
        tbody.append(row)
    }

}



function getConditionSetCurrent(){

    /*
    *  현재 화면에 입력된 조건식을 object로 parsing 하는 함수
    */

    simulation_condition_generation_tbody = document.getElementById('simulation_condition_generation_tbody')
    condition_set = []

    try {
        for (let i=0; i < simulation_condition_generation_tbody.children.length; i++){

            row_id = simulation_condition_generation_tbody.children[i].id
            feature_name   = document.getElementById(row_id + "_cell_a").getAttribute('feature_name')
            feature_name_full   = document.getElementById(row_id + "_cell_a").getAttribute('feature_name_full')



            operation = document.getElementById(row_id + "_cell_b").childNodes[0].value
            target_type = document.getElementById(row_id +  "_cell_c").childNodes[0].value

            if (target_type=="value"){
                target_value = document.getElementById(row_id + "_cell_d").childNodes[0].value
            }

            else {
                target_value = document.getElementById(row_id + "_cell_d").childNodes[0].value
                target_value = target_value + "*"
                target_value = target_value + document.getElementById(row_id + "_cell_d").childNodes[1].value
            }


            condition_set.push({"feature_name":feature_name, "feature_name_full":feature_name_full, "operation":operation, "target_value":target_value})
        }
    } catch (error) {

        return false
    }

    return condition_set

}


function saveConditionSetToServer(){

    /*
        현재 활성화된 simulation_condition_generation_table의 조건식을
        server에 저장하는 함수
        user별로 완전 일치하는 중복된 조건인지는 중복된 조건인지 체크하고
        중복되지 않았다면 insert
    */

    condition_set_name = document.getElementById("condition_set_name")
    condition_set_description = document.getElementById("condition_set_description")

    if (condition_set_name.value.length==0){

        alert("조건식 셋트의 이름을 입력해주세요")
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
                    alert('saveFeaturesToServer ERROR!')
                }
                else
                {

                    console.log(req.response)
                    getConditionSetsFromServer()

                }
            }
        }



        condition_set = getConditionSetCurrent()
        features = JSON.stringify({"condition_set":condition_set, "condition_set_name": condition_set_name.value, "condition_set_description": condition_set_description.value})

        req.open('POST', '/saveConditionSetToServer')
        req.setRequestHeader("Content-type", "application/json")
        req.send(features)
    }
}


function deleteConditionOnServer(condition_set_id){

    if(confirm("are you sure?")){


        let req = new XMLHttpRequest()
        req.responseType = 'json';
        req.onreadystatechange = function()
        {
            if (req.readyState == 4)
            {
                if (req.status != 200)
                {
                    alert('deleteConditionOnServer ERROR!')
                }
                else
                {

                    console.log(req.response)
                    getConditionSetsFromServer()
                }
            }
        }

        req.open('POST', '/deleteConditionSetOnServer')
        req.setRequestHeader("Content-type", "application/json")
        params = JSON.stringify({"condition_set_id":condition_set_id})

        req.send(params)

    }

    else {
        // DO NOTHING
    }

}

function renderFinanOnly(finan_only=false){


    // Disable non finan features click
    renderAllFeatures(finan_only)
    // Remove Current non finan featrue rows
    removeAllChildOfElement(document.getElementById('simulation_condition_generation_tbody'))
    // toggle select box
    renderRecentTradingDays(finan_only)


}