document.addEventListener("DOMContentLoaded", function(event) {

    getSpecification()

})



feature_group_change = false


function fold(class_name){

    elms = document.getElementsByClassName(class_name)

    for (let i=0; i< elms.length; i++){
        if (elms[i].style.display == 'none'){
            elms[i].style.display = 'flex'
        }
        else {
            elms[i].style.display = 'none'
        }
    }

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

                column_spec_list = req.response.column_spec_list
                feature_group_order = req.response.feature_group_order

                feature_group_name_list =[]

                grid_feature_ordering = document.getElementById('area_feature_ordering_content')

                feature_group_map = {}

                for (let i = 0; i<feature_group_order.length; i++){
                    feature_group_name_list.push(feature_group_order[i].name)
                }

                for (let i = 0; i<column_spec_list.length; i++){
                    if (column_spec_list[i].feature_for_default_table == true){
                        if (column_spec_list[i].feature_group in feature_group_map){
                            feature_group_map[column_spec_list[i].feature_group].push(column_spec_list[i].column_name)
                        }

                        else {
                            feature_group_map[column_spec_list[i].feature_group] = [column_spec_list[i].column_name]
                        }
                    }
                }


                for (let feature_group_name in feature_group_map){

                    use_yn = true
                    for (let i=0; i<feature_group_order.length; i++){
                        if (feature_group_order[i].name == feature_group_name){
                            use_yn = feature_group_order[i].use_yn
                            break
                        }
                    }
                    // console.log(feature_group_name, feature_group_map[feature_group_name], use_yn)
                    let feature_group = document.createElement('div');

                    feature_group.setAttribute("class", "feature_group")
                    feature_group.setAttribute("sortable_id", feature_group_name)
                    feature_group.id = "feature_group_id_" + feature_group_name
                    feature_group.name = feature_group_name
                    feature_group.value = use_yn

                    title = document.createElement('h2');
                    title.innerHTML = feature_group_name.toUpperCase();

                    checkbox = document.createElement("input")
                    checkbox.setAttribute('class', 'feature_group_checkbox')
                    checkbox.setAttribute('type','checkbox')
                    if (undefined != use_yn & true == use_yn){
                        checkbox.setAttribute('checked', use_yn);
                    }
                    checkbox.setAttribute("onchange", "FeatureGroupUseYnToggleCheckbox(this, '"+feature_group_name+"')")
                    checkbox_label = document.createElement('label');
                    checkbox_label.setAttribute('for', 'feature_use_yn_' + feature_group_name);
                    checkbox_label.innerText = '표시여부';

                    if (['default'].includes(feature_group_name)){
                        feature_group.setAttribute("class", "feature_group filtered")
                        checkbox.setAttribute('disabled',true);
                    }
                    else{
                        feature_group.setAttribute("class", "feature_group")
                    }



                    feature_group.appendChild(title)
                    feature_group.appendChild(checkbox)
                    feature_group.appendChild(checkbox_label)

                    for(let i=0; i < feature_group_map[feature_group_name].length; i++){
                        feature = document.createElement('p');
                        feature.innerHTML = feature_group_map[feature_group_name][i].toUpperCase();
                        feature_group.appendChild(feature)
                    }
                    grid_feature_ordering.appendChild(feature_group);
                }


                // console.log(feature_group_name_list)

                elemnt = document.getElementById("area_feature_ordering_content")
                sortable_obj = new Sortable(elemnt, {
                    // direction: 'vertical',
                    filter: '.filtered',
                    animation: 150,
                    dataIdAttr:'sortable_id',
                    setData: function (/** DataTransfer */dataTransfer, /** HTMLElement*/dragEl) {
                        // console.log("sortable setdata!!")
                        dataTransfer.setData('Text', dragEl.textContent); // `dataTransfer` object of HTML5 DragEvent
                    },
                    onStart: function (/**Event*/evt) {
                        // console.log("sortable onstart!")
		                evt.oldIndex;  // element index within parent
	                },
                    onUpdate: function (evt) {
                        // console.log("sortable!")
                    },
                    onMove: function (evt) {
                        return evt.related.className.indexOf('filtered') === -1;
                    },




                });

                sortable_obj.sort(feature_group_name_list)

            }
        }
    }

    req.open('POST', '/getSpecification')
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    req.send()
}

function FeatureGroupUseYnToggleCheckbox(checkbox, feature_group_name) {

    feature_group_checkbox = document.getElementsByClassName("feature_group_checkbox")
    check_count =0
    for (let i=0; i < feature_group_checkbox.length; i++){
        if (feature_group_checkbox[i].checked){
            check_count+=1
        }
    }

    feature_group = document.getElementById("feature_group_id_" + feature_group_name)
    if (check_count <= 5){
        alert("컬럼그룹을 5개 이상 선택하셔야 합니다")
        checkbox.checked = true
    }

    else{
        if(checkbox.checked == true){
            feature_group.value = true
        }else{
            feature_group.value = false
        }
   }
}


function setFeatureGroupOrder(){

    let req = new XMLHttpRequest()
    req.responseType = 'json';

    req.onreadystatechange = function()
    {
        if (req.readyState == 4)
        {
            if (req.status == 200){
                alert("컬럼 좌우정렬이 현재상태로 저장되었습니다.\n기본화면으로 돌아가서 확인해보세요!")
            }
        }
    }




    feature_group = document.getElementsByClassName("feature_group")
    feature_group_order_list = []
    for (let i =0; i< feature_group.length; i++){
        use_yn = feature_group[i].value
        feature_group_order_list.push({"name": feature_group[i].name, "order":i, "use_yn": use_yn})
    }


    feature_group_order = JSON.stringify({"feature_group_order":feature_group_order_list})
    req.open('POST', '/setFeatureGroupOrder')
    req.setRequestHeader("Content-type", "application/json")
    req.send(feature_group_order)

}