function renderSimulationTab(){

    getAllFeaturesForSimulation()
    renderRecentTradingDays()
    renderConditionGenerationArea()
    // getSpecificFeatureStats()

}


let condition_queue = []
let features_map = {}
let feature_type_list = []
let simulation_result = undefined

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


function renderAllFeatures(){
    /*
    *     가져온 모든 features를 화면에다 버튼으로 뿌리는 함수
    */

    simulation_feature_selection_area = document.getElementById("simulation_feature_selection_area")

    while (simulation_feature_selection_area.firstChild){
        simulation_feature_selection_area.removeChild(simulation_feature_selection_area.lastChild)
    }


    let table = document.createElement("table")
    table.setAttribute("class", "table_simulation table_simulation_feature")

    let thead = document.createElement("thead")
    let row = document.createElement("tr")
    let cell_a = document.createElement("th")
    let cell_b = document.createElement("th")

    cell_a.innerHTML="FEATURE_TYPE"
    cell_b.innerHTML="FEATURES"

    row.appendChild(cell_a)
    row.appendChild(cell_b)
    thead.appendChild(row)

    let tbody = document.createElement("tbody")

    table.appendChild(thead)
    table.appendChild(tbody)

    /*
        TYPE 별로 한 CELL을 먹도록..
    */
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


                cell_b_content.setAttribute("class", "button_simulation_features")
                // cell_b_content.setAttribute("onclick","addConditionInputRow(this.textContent, this.getAttribute('feature_name_full'))")
                cell_b_content.setAttribute("onclick","addConditionInputRow('"+ feature_name +"','" + feature_name_full + "')")
                cell_b.appendChild(cell_b_content)
            }
        }

        row.appendChild(cell_a)
        row.appendChild(cell_b)

        tbody.appendChild(row)

    }

    simulation_feature_selection_area.appendChild(table)


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

    console.log('addConditionInputRow:', feature_name, feature_name_full, preset_operation, preset_target_value)

    simulation_condition_generation_tbody = document.getElementById("simulation_condition_generation_tbody")

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
    console.log(row_id)
    let row = document.getElementById(row_id);
    console.log(row)
    row.parentNode.removeChild(row);
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


                html = req.response.simulation_result_table_html
                column_list = req.response.simulation_result_column_list
                simulation_result = req.response.simulation_result_table_json
                elapsed_time = req.response.elapsed_time
                setFeaturesToLocalStorage(JSON.stringify(condition_set), from_date, to_date)
                getSimulationSummary()
                console.log('simulationRequest elapsed time: ', elapsed_time)

                if (document.getElementById("table_simulation").hasAttribute("aria-describedby") == true){
                    clearTable("table_simulation")
                }

                renderTable("table_simulation", html, column_list, ratio=0.5, fixedLeft=2)

            }
        }
    }

    condition_set = getConditionSetCurrent()
    from_date = document.getElementById('simulation_from_date').value
    to_date = document.getElementById('simulation_to_date').value

    features = JSON.stringify({"condition_set":condition_set, "from_date":from_date, "to_date":to_date})


    req.open('POST', '/getSimulationResult')
    req.setRequestHeader("Content-type", "application/json")
    req.send(features)

}

function getSimulationSummary(){


    df = new dfd.DataFrame(simulation_result)

    //  let grp = df.groupby(["YY", "MM"])
    //  grp.agg({"PRO1":"mean","PRO3":"mean", "PRO5":"mean", "PRO10":"mean", "STOCKCODE":"count"}).print()


    grp = df.groupby(["YY"])
    grp.agg({"PRO1":"mean","PRO3":"mean", "PRO5":"mean", "PRO10":"mean", "STOCKCODE":"count"}).print()
    grp.agg({"PRO1":"std","PRO3":"std", "PRO5":"std", "PRO10":"std", "STOCKCODE":"count"}).print()

    // grp.agg({"PRO1":"mean","PRO3":"mean", "PRO5":"mean", "PRO10":"mean", "STOCKCODE":"count"}).col_data
    // grp.agg({"PRO1":"mean","PRO3":"mean", "PRO5":"mean", "PRO10":"mean", "STOCKCODE":"count"}).column_names

    // >> [[...], [...], [...], [...], [...], [...]] COLUMN 기준으로 출력됨
    // >>  ["YY", "PRO1_mean", "PRO3_mean", "PRO5_mean", "PRO10_mean", "STOCKCODE_count"]




}



function setFeaturesToLocalStorage(feature_rows, from_date='2020-01-02', to_date='2021-07-23'){

    localStorage.setItem("jazzstock_recent_features_simulation", feature_rows)
    localStorage.setItem("jazzstock_from_date_simulation", from_date)
    localStorage.setItem("jazzstock_to_date_simulation", to_date)

}



function renderSpecificFeatureStats(feature_name, stats){


}



function renderRecentTradingDays(){

    simulation_target_date_area = document.getElementById("simulation_target_date_area")


    while (simulation_target_date_area.firstChild){
        simulation_target_date_area.removeChild(simulation_target_date_area.lastChild)
    }



    select_box_from = document.createElement("select")
    select_box_from.setAttribute("id","simulation_from_date")
    select_box_to = document.createElement("select")
    select_box_to.setAttribute("id","simulation_to_date")

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

    simulation_target_date_area.appendChild(select_box_from)
    simulation_target_date_area.appendChild(select_box_to)

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



function renderFeatures(feature_rows){

    simulation_condition_generation_tbody = document.getElementById("simulation_condition_generation_tbody")
    while (simulation_condition_generation_tbody.firstChild){
        simulation_condition_generation_tbody.removeChild(simulation_condition_generation_tbody.lastChild)
    }

    for (let i=0; i< feature_rows.length; i++){
        console.log("renderFeatures...", feature_rows[i])
        addConditionInputRow(feature_rows[i].feature_name, feature_rows[i].feature_name_full, feature_rows[i].operation, feature_rows[i].target_value)
    }


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

                console.log(req.response)
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
    condition_set = response.result
    console.log(condition_set)
    console.log(condition_set.length)

    console.log(condition_set)
    console.log("b", condition_set.length)

    for (let i = 0; i< condition_set.length; i++){

        row = document.createElement("tr")
        cell_name = document.createElement("td")
        cell_timestamp = document.createElement("td")
        cell_delete = document.createElement("td")

        button = document.createElement('button')
        button.innerHTML = condition_set[i].CONDITION_SET_NAME
        button.value = condition_set[i].CONDITION_SET_VALUE
        button.setAttribute("onclick", "renderFeatures(JSON.parse(this.value))")

        cell_timestamp.innerHTML = 'ABC'
        cell_delete.innerHTML = 'DEF'

        cell_name.appendChild(button)
        row.appendChild(cell_name)
        row.appendChild(cell_timestamp)
        row.appendChild(cell_delete)
        tbody.append(row)
    }

}


function getConditionSetCurrent(){

    /*
    *  현재 화면에 입력된 조건식을 object로 parsing 하는 함수
    */

    simulation_condition_generation_tbody = document.getElementById('simulation_condition_generation_tbody')
    condition_set = []
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

//
//bbw = [0.089, 0.085, 0.075, 0.057, 0.078, 0.063, 0.063, 0.11, 0.097, 0.117, 0.064, 0.051, 0.095, 0.059, 0.066, 0.074, 0.057, 0.057, 0.092, 0.058, 0.065, 0.068, 0.084, 0.065, 0.079, 0.082, 0.07, 0.069, 0.083, 0.101, 0.114, 0.081, 0.085, 0.064, 0.032, 0.111, 0.104, 0.083, 0.103, 0.091, 0.117, 0.063, 0.092, 0.074, 0.109, 0.053, 0.116, 0.085, 0.079, 0.069, 0.031, 0.073, 0.06, 0.081, 0.106, 0.095, 0.05, 0.045, 0.077, 0.099, 0.048, 0.096, 0.065, 0.095, 0.089, 0.076, 0.075, 0.066, 0.073, 0.105, 0.112, 0.043, 0.089, 0.114, 0.112, 0.019, 0.013, 0.083, 0.097, 0.113, 0.058, 0.117, 0.058, 0.09, 0.093, 0.091, 0.096, 0.079, 0.062, 0.098, 0.092, 0.1, 0.091, 0.102, 0.093]
//
//pro = [0, 30.9, -5.1, -3.5, -4, -5.6, 1.6, 7.5, 5.1, 9.3, 1.2, 0.3, 3.1, -0.4, 0.3, -1.1, 1.4, 2.2, -1.7, 5.1, -4.6, -6.7, 2.8, 1.6, -3.1, 9.5, 5.6, 4.5, 14, 5.6, -4.4, -0.8, 5.9, -0.9, 2.9, 4.9, 0.2, 6.2, 2.4, 0, 6.1, -6.5, -6.5, -3.3, 2.6, 8.1, 9.1, -1.4, -1.5, 6.7, 0.4, -3.2, 4.2, 8, -2.4, 1.8, 2.1, -3.4, -4.3, 3.9, 0.2, -2.5, 1.4, -7.4, -7.3, -1, -1.5, -1.3, -3.2, -0.8, 15.1, 2.4, 19.2, 2.1, 12.5, 0, -2.6, -0.9, 4.8, -5.7, -3.8, 4.4, -2.1, 4.1, 1.5, 6.5, -2.5, 24.3, 0.2, 1.6, 4.6, -1.1, -11.3, 3.1, -0.7]
//
//var trace2 = {
//  x: bbw,
//  y: pro,
//  mode: 'markers',
//  type: 'scatter',
//  name: 'Team B',
//  text: ['B-a', 'B-b', 'B-c', 'B-d', 'B-e'],
//  marker: { size: 12 }
//};
//
//var data = [ trace2 ];
//
//var layout = {
//  xaxis: {
//    range: [ Math.min(bbw), Math.max(bbw) ]
//  },
//  yaxis: {
//    range: [ Math.min(pro), Math.max(pro) ]
//  },
//  title:'Data Labels Hover',
//  width: 800,
//  height: 800
//};
//
//Plotly.newPlot('myDiv', data, layout);
