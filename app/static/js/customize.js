document.addEventListener("DOMContentLoaded", function(event) {


    getSpecification()



})


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
                grid_feature_ordering = document.getElementById('area_feature_ordering_content')

                feature_group_map = {}
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
                    console.log(feature_group_name, feature_group_map[feature_group_name])

                    let feature_group = document.createElement('div');
                    feature_group.setAttribute("class", "feature_group")

                    title = document.createElement('h2');
                    title.innerHTML = feature_group_name.toUpperCase();

                    feature_group.appendChild(title)

                    for(let i=0; i < feature_group_map[feature_group_name].length; i++){
                        feature = document.createElement('p');
                        feature.innerHTML = feature_group_map[feature_group_name][i].toUpperCase();
                        feature_group.appendChild(feature)
                    }








                    grid_feature_ordering.appendChild(feature_group);

                }



                elemnt = document.getElementById("area_feature_ordering_content")
                new Sortable(elemnt, {
                    // direction: 'vertical',
                    filter: '.filtered',
                    animation: 150,
                    ghostClass: 'blue-background-class',
                    onUpdate: function (/**Event*/evt) {

//                        item = stockQueue[evt.oldIndex]
//                        stockQueue.splice(evt.oldIndex, 1);
//                        stockQueue.splice(evt.newIndex, 0, item);

                    },
                });

            }
        }
    }

    req.open('POST', '/getSpecification')
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    req.send()
}