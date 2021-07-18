function renderSimulationTab(){

    getAllFeaturesForSimulation()
    renderRecentTradingDays()
    renderConditionGenerationArea()
    // getSpecificFeatureStats()

}


let condition_queue = []
let features_map = {}
let feature_type_list = []

function getAllFeaturesForSimulation(){


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

function getSpecificFeatureStats(feature_name_list){



}

function renderAllFeatures(){

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


    for (let i=0; i< feature_type_list.length; i++){

        let row = document.createElement("tr")
        let cell_a = document.createElement("td")
        let cell_b = document.createElement("td")

        cell_a.innerHTML=feature_type_list[i]

        for (feature in features_map){
            if(features_map[feature].simulation_feature_type==feature_type_list[i]){
                let cell_b_content =document.createElement("button")
                cell_b_content.innerHTML= feature

                if (features_map[feature].column_name_short != undefined & features_map[feature].column_name_full != undefined){

                    cell_b_content.value= feature.replace(features_map[feature].column_name_short, features_map[feature].column_name_full)
                    cell_b_content.setAttribute("feature_display", feature)

                }
                else {
                    cell_b_content.value= feature
                    cell_b_content.setAttribute("feature_display", feature)
                }

                // cell_b_content.setAttribute("hidden", feature)
                cell_b_content.setAttribute("class", "button_simulation_features")
                cell_b_content.setAttribute("onclick","addConditionInputRow(this.textContent, this.value)")

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



    simulation_condition_generation_area = document.getElementById("simulation_condition_generation_area")

    while (simulation_condition_generation_area.firstChild){
        simulation_condition_generation_area.removeChild(simulation_condition_generation_area.lastChild)
    }
    let table = document.createElement("table")
    table.setAttribute("id","simulation_condition_generation_table")


    table.setAttribute("class", "table_simulation table_simulation_input")

    let thead = document.createElement("thead")
    let row = document.createElement("tr")
    let cell_a = document.createElement("th")
    let cell_b = document.createElement("th")
    let cell_c = document.createElement("th")
    let cell_d = document.createElement("th")

    cell_a.innerHTML="FEATURE"
    cell_b.innerHTML="OPERATION"
    cell_c.innerHTML="TARGET_TYPE"
    cell_d.innerHTML="TARGET_VALUE"

    row.appendChild(cell_a)
    row.appendChild(cell_b)
    row.appendChild(cell_c)
    row.appendChild(cell_d)
    thead.appendChild(row)


    let tbody = document.createElement("tbody")
    tbody.setAttribute("id","simulation_condition_generation_tbody")

    table.appendChild(thead)
    table.appendChild(tbody)


    simulation_feature_selection_area.appendChild(table)

}

function getConditionInputRowId(){

    id = "condition_row_" + condition_queue.length
    condition_queue.push(id)

    return id

}

function addConditionInputRow(feature_name_display, feature_name_db, preset_operation=null, preset_target_value=null){

    row_id = getConditionInputRowId()

    console.log('addConditionInputRow:', feature_name_display, feature_name_db, preset_operation, preset_target_value)


    simulation_condition_generation_tbody = document.getElementById("simulation_condition_generation_tbody")

    let row = document.createElement("tr")
    row.setAttribute("id", row_id)

    let cell_a = document.createElement("td")
    let cell_b = document.createElement("td")
    let cell_c = document.createElement("td")
    let cell_d = document.createElement("td")
    cell_a.setAttribute("id", row_id+"_cell_a")
    cell_b.setAttribute("id", row_id+"_cell_b")
    cell_c.setAttribute("id", row_id+"_cell_c")
    cell_d.setAttribute("id", row_id+"_cell_d")

    cell_a.innerHTML=feature_name_display
    cell_a.value=feature_name_db

    button_get_distribution =document.createElement("button")
    button_get_distribution.innerHTML= "distrib."
    button_get_distribution.setAttribute("class", "button_simulation_input")
    button_get_distribution.setAttribute("onclick", "getDistribution('"+feature_name+"')")


    button_delete =document.createElement("button")
    button_delete.innerHTML= "delete"
    button_delete.setAttribute("class", "button_simulation_input")
    button_delete.setAttribute("onclick","deleteRow('"+row_id+"')")

    cell_a.appendChild(button_get_distribution)
    cell_a.appendChild(button_delete)

    // ======================================================================================

    select_box_operation = document.createElement("select")


    const operations = [">", ">=", "==", '<', "<="];
    for (let operation of operations) {
        option = document.createElement("option")
        option.value = operation
        option.innerHTML = operation


        if (operation == preset_operation){
            console.log("jazz!")
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


    console.log("bird!!", preset_target_value)

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
        console.log("stock!!", preset_target_value)
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
                console.log(html)
                console.log(column_list)
                console.log(feature_rows)
                setFeaturesToLocalStorage(JSON.stringify(feature_rows))

                if (document.getElementById("table_simulation").hasAttribute("aria-describedby") == true){
                    clearTable("table_simulation")
                }

                renderTable("table_simulation", html, column_list, ratio=0.5, fixedLeft=2)

            }
        }
    }



    simulation_condition_generation_tbody = document.getElementById('simulation_condition_generation_tbody')
    from_date = document.getElementById('simulation_from_date').value
    to_date = document.getElementById('simulation_to_date').value

    feature_rows = []

    console.log(simulation_condition_generation_tbody.children.length)


    for (let i=0; i < simulation_condition_generation_tbody.children.length; i++){

        row_id = simulation_condition_generation_tbody.children[i].id

        feature_name   = document.getElementById(row_id + "_cell_a").value

        feature_name_display   = document.getElementById(row_id + "_cell_a").getAttribute

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

        console.log(i, feature_name, operation, target_value)
        feature_rows.push({"feature_name":feature_name, "operation":operation, "target_value":target_value})
    }

    features = JSON.stringify({"input":feature_rows, "from_date":from_date, "to_date":to_date})


    req.open('POST', '/getSimulationResult')
    req.setRequestHeader("Content-type", "application/json")
    req.send(features)

}





function setFeaturesToLocalStorage(feature_rows){

    localStorage.setItem("jazzstock_recent_features_simulation", feature_rows)

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


        select_box_from.appendChild(option_from)

        option_to = document.createElement("option")
        option_to.value = recent_trading_days[i]
        option_to.innerHTML = recent_trading_days[i]
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

function getFeatureRowsRecent(){


    feature_rows = localStorage.getItem("jazzstock_recent_features_simulation")

    if (feature_rows == undefined){
        alert("no saved features on local storage")
    }

    else {

        renderFeatures(JSON.parse(feature_rows))
    }

}


function renderFeatures(feature_rows){

    simulation_condition_generation_tbody = document.getElementById("simulation_condition_generation_tbody")
    while (simulation_condition_generation_tbody.firstChild){
        simulation_condition_generation_tbody.removeChild(simulation_condition_generation_tbody.lastChild)
    }

    for (let i=0; i< feature_rows.length; i++){
        addConditionInputRow(feature_rows[i].feature_name, feature_rows[i].feature_name, feature_rows[i].operation, feature_rows[i].target_value)
    }


}


function getFeaturesFromServer(){

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



function saveFeaturesToServer(){

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
