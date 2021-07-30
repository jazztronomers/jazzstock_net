document.addEventListener("DOMContentLoaded", function(event) {


    getSpecification()

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
                column_spec_list = req.response
                select_box = document.getElementById('specification_selectbox')


                for (let i = 0; i<=column_spec_list.length-1; i++){
                    let opt = document.createElement('option');
                    opt.value = column_spec_list[i].column_description;
                    opt.innerHTML = column_spec_list[i].column_name;
                    select_box.appendChild(opt);
                }
            }
        }
    }

    req.open('POST', '/getSpecification')
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    req.send()
}